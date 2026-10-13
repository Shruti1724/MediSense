"""Read saved drug-label chunks from ChromaDB without query-time embeddings."""
import re
from pathlib import Path

import chromadb
from schemas import DrugInfo

CHROMA_DIR = Path(__file__).resolve().parent.parent / "data" / "chroma"
COLLECTION_NAME = "drug_labels"
SECTION_KEYS = (
    "uses",
    "warnings",
    "who_should_avoid",
    "pregnancy",
    "side_effects",
    "interactions",
)
NOT_FOUND = "Not found in the saved label."


def _normalise(value):
    return " ".join(str(value or "").lower().split())


def get_collection(name=COLLECTION_NAME):
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    return client.get_collection(name=name)


def _cut_at_sentence(text):
    text = " ".join(str(text or "").split())
    if len(text) <= 1200:
        return text
    boundary = max(text.rfind(".", 0, 1201), text.rfind("!", 0, 1201), text.rfind("?", 0, 1201))
    return text[: boundary + 1] if boundary >= 0 else text[:1200]


AMOUNT_PATTERN = re.compile(
    r"\d[\d,\.]*\s*(mg|mcg|g|ml|tablets?|caplets?|capsules?|teaspoons?|tsp|doses?)\b"
    r"|\b\d+\s*(times|x)\s*(a|per)\s*day\b"
    r"|\bevery\s+\d+\s*(to\s*\d+\s*)?hours?\b",
    re.IGNORECASE,
)


def _clean_section(text, section):
    text = " ".join(str(text or "").split())
    # Remove a repeated leading heading, e.g. "Warnings Warnings ..." becomes "Warnings ..."
    label = section.replace("_", " ")
    if text.lower().startswith(label + " "):
        text = text[len(label) + 1:]
    # Drop any sentence that contains a dose amount
    sentences = re.split(r"(?<=[.!?])\s+", text)
    kept = [s for s in sentences if not AMOUNT_PATTERN.search(s)]
    return " ".join(kept).strip()


def _records_for(collection, generic):
    result = collection.get(where={"generic": generic}, include=["documents", "metadatas"])
    documents = result.get("documents") or []
    metadatas = result.get("metadatas") or []
    records = []
    for document, metadata in zip(documents, metadatas):
        if not isinstance(metadata, dict):
            continue
        records.append((metadata.get("section", ""), int(metadata.get("chunk", 0)), document or "", metadata))
    return sorted(records, key=lambda item: (item[0], item[1]))


def _read_generic(collection, generic):
    records = _records_for(collection, generic)
    if not records:
        return None

    section_text = {section: [] for section in SECTION_KEYS}
    openfda_name = ""
    for section, _chunk, document, metadata in records:
        if section in section_text and document:
            section_text[section].append(document)
        openfda_name = openfda_name or _normalise(metadata.get("openfda_name"))

    return {
        "generic": generic,
        "openfda_name": openfda_name,
        "sections": {
            section: (
                _cut_at_sentence(_clean_section(" ".join(section_text[section]), section)) or NOT_FOUND
            )
            for section in SECTION_KEYS
        },
    }


def _find_generic(collection, generic):
    found = _read_generic(collection, generic)
    if found:
        return found

    # These aliases accommodate the documented names when an older downloaded
    # label stores the OpenFDA synonym in its our_name field.
    aliases = {
        "paracetamol": "acetaminophen",
        "amoxicillin+clavulanate": "amoxicillin and clavulanate potassium",
    }
    alias = aliases.get(generic)
    return _read_generic(collection, alias) if alias else None


def get_drug_info(generic: str) -> dict:
    try:
        requested = _normalise(generic)
        if not requested:
            return DrugInfo(found=False).model_dump()

        collection = get_collection()
        if "+" in requested:
            ingredients = [part.strip() for part in requested.split("+") if part.strip()]
            if not ingredients:
                return DrugInfo(found=False).model_dump()
            entries = [(ingredient, _find_generic(collection, ingredient)) for ingredient in ingredients]
            if any(entry is None for _ingredient, entry in entries):
                return DrugInfo(found=False).model_dump()
            sections = {
                section: " ".join(
                    f"{ingredient}: {entry['sections'][section]}" for ingredient, entry in entries
                )
                for section in SECTION_KEYS
            }
            sources = [
                f"openFDA drug label ({entry['openfda_name']})"
                for _ingredient, entry in entries
                if entry["openfda_name"]
            ]
            return DrugInfo(found=True, sections=sections, sources=sources).model_dump()

        entry = _find_generic(collection, requested)
        if not entry:
            return DrugInfo(found=False).model_dump()
        source = f"openFDA drug label ({entry['openfda_name']})" if entry["openfda_name"] else None
        return DrugInfo(
            found=True,
            sections=entry["sections"],
            sources=[source] if source else [],
        ).model_dump()
    except Exception:
        return DrugInfo(found=False).model_dump()


if __name__ == "__main__":
    assert get_drug_info("paracetamol")["found"]
    assert get_drug_info("paracetamol")["sources"]
    assert get_drug_info("ibuprofen+paracetamol")["found"]
    assert not get_drug_info("norfloxacin")["found"]
    assert not get_drug_info("notadrug")["found"]
    assert not get_drug_info("")["found"]
    print(get_drug_info("paracetamol")["sections"]["uses"])
    print("rag self-test passed")