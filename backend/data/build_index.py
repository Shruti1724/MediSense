"""Build the persistent ChromaDB index for saved drug labels."""
import json
import re
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import OllamaEmbeddingFunction

from config import EMBED_MODEL

BASE_DIR = Path(__file__).resolve().parent
LABELS_DIR = BASE_DIR / "labels"
CHROMA_DIR = BASE_DIR / "chroma"
COLLECTION_NAME = "drug_labels"
CHUNK_LIMIT = 1000


def _embedding_model():
    # config.py currently names a sentence-transformers model, not an Ollama model.
    return "nomic-embed-text" if EMBED_MODEL == "all-MiniLM-L6-v2" else EMBED_MODEL

SECTION_FIELDS = (
    ("indications_and_usage", "uses"),
    ("warnings", "warnings"),
    ("contraindications", "who_should_avoid"),
    ("pediatric_use", "who_should_avoid"),
    ("pregnancy", "pregnancy"),
    ("adverse_reactions", "side_effects"),
    ("drug_interactions", "interactions"),
)


def _normalise_name(value):
    return " ".join(str(value or "").lower().split())


def _collapse(value):
    return " ".join(str(value or "").split())


def _split_sentences(value):
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+", value) if part.strip()]


def _chunk_text(value):
    text = _collapse(value)
    if not text:
        return []

    sentences = _split_sentences(text)
    chunks = []
    current = ""
    for sentence in sentences:
        if len(sentence) <= CHUNK_LIMIT and len(current) + len(sentence) + bool(current) <= CHUNK_LIMIT:
            current = f"{current} {sentence}".strip()
            continue

        if current:
            chunks.append(current)
            current = ""

        if len(sentence) <= CHUNK_LIMIT:
            current = sentence
            continue

        words = sentence.split()
        piece = ""
        for word in words:
            candidate = f"{piece} {word}".strip()
            if piece and len(candidate) > CHUNK_LIMIT:
                chunks.append(piece)
                piece = word
            else:
                piece = candidate
        current = piece

    if current:
        chunks.append(current)
    return chunks


def _label_documents(path):
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        our_name = _normalise_name(payload.get("our_name"))
        if not our_name or not isinstance(payload, dict):
            return [], None

        openfda = payload.get("openfda") or {}
        openfda_names = openfda.get("generic_name") or []
        openfda_name = _collapse(openfda_names[0]) if isinstance(openfda_names, list) and openfda_names else ""
        documents = []
        section_chunks = {}
        for field, section in SECTION_FIELDS:
            values = payload.get(field) or []
            if isinstance(values, str):
                values = [values]
            if not isinstance(values, list):
                continue
            for value in values:
                for chunk in _chunk_text(value):
                    section_chunks.setdefault(section, []).append(chunk)

        for section, chunks in section_chunks.items():
            for chunk_number, chunk in enumerate(chunks):
                documents.append(
                    {
                        "id": f"{our_name}:{section}:{chunk_number}",
                        "document": chunk,
                        "metadata": {
                            "generic": our_name,
                            "section": section,
                            "chunk": chunk_number,
                            "openfda_name": openfda_name,
                        },
                    }
                )
        return documents, None if documents else path.name
    except (OSError, UnicodeError, json.JSONDecodeError, AttributeError, TypeError, IndexError):
        return [], path.name


def build_index():
    embedding_function = OllamaEmbeddingFunction(
        model_name=_embedding_model(),
        url="http://localhost:11434",
    )
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_function,
    )

    documents = []
    missing_files = []
    for label_path in sorted(LABELS_DIR.glob("*.json")):
        label_documents, missing = _label_documents(label_path)
        documents.extend(label_documents)
        if missing:
            missing_files.append(missing)

    for start in range(0, len(documents), 32):
        batch = documents[start : start + 32]
        collection.add(
            ids=[item["id"] for item in batch],
            documents=[item["document"] for item in batch],
            metadatas=[item["metadata"] for item in batch],
        )

    generic_count = len({item["metadata"]["generic"] for item in documents})
    print(f"Stored {generic_count} generics and {len(documents)} chunks.")
    if missing_files:
        print("No usable text:", ", ".join(missing_files))
    else:
        print("No label files had missing usable text.")
    return collection


if __name__ == "__main__":
    build_index()
