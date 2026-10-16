"""Verified interaction checks backed by the local interaction dataset."""
import json
import csv
from functools import lru_cache
from pathlib import Path

from schemas import Clash

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "interactions.json"
_MEDICINES_PATH = Path(__file__).resolve().parent.parent / "data" / "medicines.csv"
_SEVERITY_ORDER = {"major": 0, "moderate": 1, "minor": 2}


def _normalise(value):
    return str(value or "").strip().lower()


def _pair_key(first, second):
    return tuple(sorted((first, second)))


def _catalog_ingredients():
    ingredients = set()
    try:
        with _MEDICINES_PATH.open("r", newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                for ingredient in _normalise(row.get("generic", "")).split("+"):
                    if ingredient:
                        ingredients.add(ingredient)
    except (OSError, UnicodeError, csv.Error):
        pass
    return ingredients


@lru_cache(maxsize=1)
def _load_interactions():
    try:
        payload = json.loads(_DATA_PATH.read_text(encoding="utf-8"))
        if not isinstance(payload, list):
            return (), frozenset()
        valid = []
        known = _catalog_ingredients()
        seen = set()
        for item in payload:
            if not isinstance(item, dict):
                continue
            required = {"drug_a", "drug_b", "severity", "note", "source", "verified"}
            if set(item) != required:
                continue
            drug_a = _normalise(item["drug_a"])
            drug_b = _normalise(item["drug_b"])
            severity = _normalise(item["severity"])
            if not drug_a or not drug_b or drug_a == drug_b or severity not in _SEVERITY_ORDER:
                continue
            known.update((drug_a, drug_b))
            key = _pair_key(drug_a, drug_b)
            if key in seen:
                continue
            seen.add(key)
            if item["verified"] is True:
                valid.append((drug_a, drug_b, severity, str(item["note"]), str(item["source"])))
        return tuple(valid), frozenset(known)
    except (OSError, UnicodeError, json.JSONDecodeError, TypeError, ValueError):
        return (), frozenset()


def check_clashes(generics: list[str], brands: list[str] | None = None) -> list:
    try:
        if not generics or len(generics) < 2:
            return []
        if brands is None or len(brands) != len(generics):
            brands = list(generics)

        verified_pairs, known_ingredients = _load_interactions()
        entries = []
        for raw_entry in generics:
            ingredients = []
            for part in _normalise(raw_entry).split("+"):
                ingredient = part.strip()
                if ingredient and ingredient in known_ingredients and ingredient not in ingredients:
                    ingredients.append(ingredient)
            entries.append(ingredients)
        if len(entries) < 2:
            return []

        clashes = []
        emitted = set()
        first_entry_for_ingredient = {}
        duplicate_ingredients = []
        for entry_index, ingredients in enumerate(entries):
            for ingredient in ingredients:
                if ingredient in first_entry_for_ingredient:
                    first_index = first_entry_for_ingredient[ingredient]
                    duplicate_ingredients.append((ingredient, first_index, entry_index))
                else:
                    first_entry_for_ingredient[ingredient] = entry_index

        for ingredient, first_index, second_index in duplicate_ingredients:
            key = ("ingredient", ingredient, min(first_index, second_index), max(first_index, second_index))
            if key in emitted:
                continue
            emitted.add(key)

            name_a = brands[first_index].strip() if brands and first_index < len(brands) else generics[first_index].strip()
            name_b = brands[second_index].strip() if brands and second_index < len(brands) else generics[second_index].strip()

            if name_a.lower() != name_b.lower():
                display_a = name_a
                display_b = name_b
                note = (
                    f"Both {name_a} and {name_b} contain {ingredient}. "
                    f"Taking them together on the same day can cause an accidental {ingredient} overdose. "
                    "Contact your doctor or pharmacist before taking both."
                )
            else:
                display_a = name_a
                display_b = name_b
                note = (
                    f"More than one of these medicines contains {ingredient}. "
                    "Taking them together can add up to too much of it. "
                    "Contact your doctor or pharmacist before the next dose."
                )

            clashes.append(
                Clash(
                    drug_a=display_a,
                    drug_b=display_b,
                    severity="major",
                    note=note,
                    source="Ingredient check",
                ).model_dump()
            )

        verified_lookup = {
            _pair_key(drug_a, drug_b): (severity, note, source)
            for drug_a, drug_b, severity, note, source in verified_pairs
        }
        for first_index, first_ingredients in enumerate(entries):
            for second_index in range(first_index + 1, len(entries)):
                for drug_a in first_ingredients:
                    for drug_b in entries[second_index]:
                        if drug_a == drug_b:
                            continue
                        pair_key = _pair_key(drug_a, drug_b)
                        pair_emit_key = (pair_key, min(first_index, second_index), max(first_index, second_index))
                        if pair_emit_key in emitted or pair_key not in verified_lookup:
                            continue
                        severity, note, source = verified_lookup[pair_key]
                        emitted.add(pair_emit_key)

                        name_a = brands[first_index].strip() if brands and first_index < len(brands) else drug_a
                        name_b = brands[second_index].strip() if brands and second_index < len(brands) else drug_b

                        if name_a.lower() != drug_a.lower() and name_b.lower() != drug_b.lower():
                            display_a = f"{name_a} ({drug_a})"
                            display_b = f"{name_b} ({drug_b})"
                        elif name_a.lower() != drug_a.lower():
                            display_a = f"{name_a} ({drug_a})"
                            display_b = name_b
                        elif name_b.lower() != drug_b.lower():
                            display_a = name_a
                            display_b = f"{name_b} ({drug_b})"
                        else:
                            display_a = drug_a
                            display_b = drug_b

                        clashes.append(
                            Clash(
                                drug_a=display_a,
                                drug_b=display_b,
                                severity=severity,
                                note=note,
                                source=source,
                            ).model_dump()
                        )

        clashes.sort(key=lambda clash: _SEVERITY_ORDER[clash["severity"]])
        return clashes
    except Exception:
        return []


if __name__ == "__main__":
    duplicate = check_clashes(["ibuprofen+paracetamol", "paracetamol"])
    assert len(duplicate) == 1 and duplicate[0]["severity"] == "major", duplicate
    assert duplicate[0]["source"] == "Ingredient check", duplicate
    assert check_clashes(["paracetamol", "cetirizine"]) == []
    assert check_clashes(["paracetamol"]) == []

    raw_pairs = json.loads(_DATA_PATH.read_text(encoding="utf-8"))
    seen = set()
    for pair in raw_pairs:
        assert set(pair) == {"drug_a", "drug_b", "severity", "note", "source", "verified"}
        assert pair["severity"] in {"major", "moderate", "minor"}
        assert pair["drug_a"] != pair["drug_b"]
        key = _pair_key(pair["drug_a"], pair["drug_b"])
        assert key not in seen
        seen.add(key)
        if pair["verified"]:
            result = check_clashes([pair["drug_a"], pair["drug_b"]])
            assert any(item["drug_a"] in key and item["drug_b"] in key for item in result)

    print("interactions self-test passed")
