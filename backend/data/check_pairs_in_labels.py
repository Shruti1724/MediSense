"""Print saved-label evidence for each configured interaction pair."""
import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
LABELS_DIR = BASE_DIR / "labels"
INTERACTIONS_PATH = BASE_DIR / "interactions.json"
KEYWORDS = (
    "NSAID",
    "nonsteroidal",
    "anticoagulant",
    "antiplatelet",
    "bleeding",
    "antacid",
    "calcium",
    "QT",
    "corticosteroid",
)


def _sentences(value):
    return [part.strip() for part in re.split(r"(?<=[.!?])\s+", str(value or "")) if part.strip()]


def _load_labels():
    labels = {}
    for path in sorted(LABELS_DIR.glob("*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            our_name = " ".join(str(payload.get("our_name", "")).lower().split())
            if our_name:
                labels[our_name] = payload
        except (OSError, UnicodeError, json.JSONDecodeError, AttributeError, TypeError):
            continue
    return labels


def _evidence(payload, other):
    texts = []
    for field in ("drug_interactions", "warnings"):
        values = payload.get(field) or []
        if isinstance(values, str):
            values = [values]
        for value in values:
            for sentence in _sentences(value):
                lowered = sentence.lower()
                if other in lowered or any(keyword.lower() in lowered for keyword in KEYWORDS):
                    texts.append(sentence)
    return texts[:2]


def main():
    pairs = json.loads(INTERACTIONS_PATH.read_text(encoding="utf-8"))
    labels = _load_labels()
    for pair in pairs:
        drug_a = pair["drug_a"]
        drug_b = pair["drug_b"]
        evidence = []
        first = labels.get(drug_a)
        second = labels.get(drug_b)
        if first:
            evidence.extend(_evidence(first, drug_b))
        if second and len(evidence) < 2:
            evidence.extend(_evidence(second, drug_a))
        print(f"{drug_a} + {drug_b}")
        if evidence:
            for sentence in evidence[:2]:
                print(f"  {sentence}")
        else:
            print("  no mention in saved labels")


if __name__ == "__main__":
    main()
