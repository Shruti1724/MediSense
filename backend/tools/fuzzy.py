"""Medicine-name matching backed by the local medicine CSV."""
import csv
import re
from functools import lru_cache
from pathlib import Path

from rapidfuzz import fuzz
from schemas import MedicineMatch

_REQUIRED_COLUMNS = ("brand", "generic", "type", "drug_class", "common_use")
_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "medicines.csv"


def _normalise(value: str) -> str:
    return "".join(character for character in value.lower() if character.isalnum())


@lru_cache(maxsize=1)
def _load_medicines() -> tuple[dict[str, str], ...]:
    try:
        with _DATA_PATH.open("r", newline="", encoding="utf-8") as csv_file:
            reader = csv.DictReader(csv_file)
            if not reader.fieldnames or any(column not in reader.fieldnames for column in _REQUIRED_COLUMNS):
                return ()

            rows = []
            for row in reader:
                if not row or any(not row.get(column, "").strip() for column in _REQUIRED_COLUMNS):
                    continue
                if row["type"].strip() not in {"OTC", "prescription-only"}:
                    continue
                rows.append({column: row[column].strip() for column in _REQUIRED_COLUMNS})
            return tuple(rows)
    except (OSError, UnicodeError, csv.Error):
        return ()


def _empty_match() -> dict:
    return MedicineMatch(matched=False, score=0.0, candidates=[]).model_dump()


def match_medicine(name: str) -> dict:
    """Match a typed medicine name against the local CSV without raising errors."""
    try:
        typed_name = (name or "").strip()
        cleaned_typed = re.sub(
            r"^(?:tab(?:let)?|cap(?:sule)?|syp|syrup|inj(?:ection)?|oint(?:ment)?)\.?\s+",
            "",
            typed_name,
            flags=re.IGNORECASE,
        ).strip()
        cleaned_no_unit = re.sub(
            r"(?<=\d)\s*(?:mg|ml|mcg|gm|g)\b",
            "",
            cleaned_typed,
            flags=re.IGNORECASE,
        ).strip()
        normalised_name = _normalise(typed_name)
        normalised_clean = _normalise(cleaned_typed)
        normalised_no_unit = _normalise(cleaned_no_unit)
        if not normalised_name:
            return _empty_match()

        rows = _load_medicines()
        if not rows:
            return _empty_match()

        comparisons = []
        for row_index, row in enumerate(rows):
            brand_norm = _normalise(row["brand"])
            generic_norm = _normalise(row["generic"])
            b_score = max(
                fuzz.ratio(normalised_name, brand_norm),
                fuzz.ratio(normalised_clean, brand_norm),
                fuzz.ratio(normalised_no_unit, brand_norm),
            ) / 100
            g_score = max(
                fuzz.ratio(normalised_name, generic_norm),
                fuzz.ratio(normalised_clean, generic_norm),
                fuzz.ratio(normalised_no_unit, generic_norm),
            ) / 100
            comparisons.append((b_score, row_index, "brand"))
            comparisons.append((g_score, row_index, "generic"))


        best_score, best_row_index, best_field = max(
            comparisons,
            key=lambda item: (item[0], -item[1], 1 if item[2] == "brand" else 0),
        )

        best_by_brand = {}
        for score, row_index, _field in comparisons:
            brand = rows[row_index]["brand"]
            if brand not in best_by_brand or score > best_by_brand[brand][0]:
                best_by_brand[brand] = (score, row_index)
        candidates = [
            brand
            for brand, _score_and_index in sorted(
                best_by_brand.items(),
                key=lambda item: (-item[1][0], item[1][1]),
            )[:3]
        ]

        rounded_score = round(best_score, 2)
        if best_score < 0.85:
            return MedicineMatch(matched=False, score=rounded_score, candidates=candidates).model_dump()

        matched_row = rows[best_row_index]
        brand = typed_name if best_field == "generic" else matched_row["brand"]
        return MedicineMatch(
            matched=True,
            brand=brand,
            generic=matched_row["generic"],
            type=matched_row["type"],
            drug_class=matched_row["drug_class"],
            common_use=matched_row["common_use"],
            score=rounded_score,
            candidates=candidates,
        ).model_dump()
    except Exception:
        return _empty_match()


if __name__ == "__main__":
    augmentin = match_medicine("Augmantin 625")
    assert augmentin["matched"] and augmentin["generic"] == "amoxicillin+clavulanate", augmentin

    assert match_medicine("dolo650")["matched"]
    assert match_medicine("Crocin")["matched"]
    assert match_medicine("paracetamol")["matched"]
    assert not match_medicine("Xyzabc")["matched"]
    assert not match_medicine("")["matched"]

    dolo = match_medicine("Dolo")
    assert not dolo["matched"], dolo
    assert dolo["candidates"][0] == "Dolo 650", dolo

    print("fuzzy self-test passed")
