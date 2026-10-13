"""Mark one interaction pair as human-verified after URL review."""
import json
import sys
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / "interactions.json"


def main():
    if len(sys.argv) != 4:
        print("Usage: python3 data/mark_verified.py <drug_a> <drug_b> <url>")
        return 2

    drug_a, drug_b, url = (value.strip().lower() for value in sys.argv[1:])
    if not url.startswith("https://"):
        print("Refusing: source URL must start with https://")
        return 1
    if not drug_a or not drug_b or drug_a == drug_b:
        print("Refusing: drug names must be non-empty and different")
        return 1

    try:
        pairs = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        print(f"Refusing: could not read interactions.json: {error}")
        return 1

    target = {drug_a, drug_b}
    found = None
    for pair in pairs:
        if {str(pair.get("drug_a", "")).lower(), str(pair.get("drug_b", "")).lower()} == target:
            found = pair
            break
    if found is None:
        print(f"Refusing: pair not found: {drug_a} + {drug_b}")
        return 1

    found["verified"] = True
    found["source"] = url
    DATA_PATH.write_text(json.dumps(pairs, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Verified {found['drug_a']} + {found['drug_b']}")
    print(f"source: {url}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
