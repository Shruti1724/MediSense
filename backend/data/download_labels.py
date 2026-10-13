import json
import time
from pathlib import Path
from urllib.parse import quote

import requests

BASE_URL = "https://api.fda.gov/drug/label.json"
LABELS_DIR = Path(__file__).resolve().parent / "labels"

PAIRS = [
    ("paracetamol", "acetaminophen"),
    ("ibuprofen", "ibuprofen"),
    ("aspirin", "aspirin"),
    ("amoxicillin+clavulanate", "amoxicillin and clavulanate potassium"),
    ("azithromycin", "azithromycin"),
    ("cetirizine", "cetirizine"),
    ("levocetirizine", "levocetirizine"),
    ("fexofenadine", "fexofenadine"),
    ("montelukast", "montelukast"),
    ("pantoprazole", "pantoprazole"),
    ("omeprazole", "omeprazole"),
    ("famotidine", "famotidine"),
    ("metformin", "metformin"),
    ("amlodipine", "amlodipine"),
    ("telmisartan", "telmisartan"),
    ("atorvastatin", "atorvastatin"),
    ("ciprofloxacin", "ciprofloxacin"),
    ("norfloxacin", "norfloxacin"),
    ("cefixime", "cefixime"),
    ("diclofenac", "diclofenac"),
    ("naproxen", "naproxen"),
    ("mefenamic acid", "mefenamic acid"),
    ("dicyclomine", "dicyclomine"),
    ("warfarin", "warfarin"),
    ("clopidogrel", "clopidogrel"),
    ("doxycycline", "doxycycline"),
    ("prednisolone", "prednisolone"),
    ("ondansetron", "ondansetron"),
    ("loratadine", "loratadine"),
    ("amoxicillin", "amoxicillin"),
    ("domperidone", "domperidone"),
]

FIELDS = [
    "indications_and_usage",
    "warnings",
    "contraindications",
    "pregnancy",
    "pediatric_use",
    "drug_interactions",
    "adverse_reactions",
    "openfda",
]


def sanitize_name(name: str) -> str:
    return name.replace("+", "_").replace(" ", "_")


def fetch_label(openfda_name: str):
    encoded_name = quote(openfda_name)
    url = f'{BASE_URL}?search=openfda.generic_name:"{encoded_name}"&limit=1'
    try:
        response = requests.get(url, timeout=20)
        response.raise_for_status()
        payload = response.json()
        results = payload.get("results") or []
        if not results:
            return None
        result = results[0]
        filtered = {}
        for field in [
            "indications_and_usage",
            "warnings",
            "contraindications",
            "pregnancy",
            "pediatric_use",
            "drug_interactions",
            "adverse_reactions",
        ]:
            if field in result:
                filtered[field] = result[field]
        if "openfda" in result and isinstance(result["openfda"], dict):
            filtered["openfda"] = {}
            if "generic_name" in result["openfda"]:
                filtered["openfda"]["generic_name"] = result["openfda"]["generic_name"]
        filtered["our_name"] = openfda_name
        return filtered
    except Exception:
        return None


def main():
    LABELS_DIR.mkdir(parents=True, exist_ok=True)
    saved_count = 0
    not_found = []

    for our_name, openfda_name in PAIRS:
        file_name = sanitize_name(our_name)
        data = fetch_label(openfda_name)
        if data is None:
            print(f"NOT FOUND: {our_name}")
            not_found.append(our_name)
        else:
            output_path = LABELS_DIR / f"{file_name}.json"
            with output_path.open("w", encoding="utf-8") as fh:
                json.dump(data, fh, ensure_ascii=False, indent=2)
            saved_count += 1
        time.sleep(0.5)

    print(f"Saved: {saved_count}")
    print("Not found:", ", ".join(not_found) if not_found else "none")


if __name__ == "__main__":
    main()
