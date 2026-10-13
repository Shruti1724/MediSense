"""Deterministic condition lookup from sourced local data, with no LLM call."""
import json
import re
from functools import lru_cache
from pathlib import Path

from schemas import ConditionInfo

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "conditions.json"
_UNSAFE = re.compile(r"you have|you are suffering|safe for you|\b\d+\s*(?:mg|ml|tablets?|pills?|times?\s+a\s+day)\b", re.IGNORECASE)


def _safe_items(items):
    return [str(item).strip() for item in items if str(item).strip() and not _UNSAFE.search(str(item))]


@lru_cache(maxsize=1)
def _load_conditions():
    try:
        payload = json.loads(_DATA_PATH.read_text(encoding="utf-8"))
        return tuple(item for item in payload if isinstance(item, dict)) if isinstance(payload, list) else ()
    except (OSError, UnicodeError, json.JSONDecodeError, TypeError):
        return ()


def get_condition_info(drug_classes: list[str]) -> dict:
    try:
        requested = {str(value or "").strip().casefold() for value in drug_classes if str(value or "").strip()}
        matches = [item for item in _load_conditions() if requested.intersection({str(value).strip().casefold() for value in item.get("drug_classes", [])})]
        if not matches:
            return ConditionInfo(found=False).model_dump()

        symptoms = []
        red_flags = []
        sources = []
        uses = []
        for item in matches:
            uses.extend(_safe_items([item.get("commonly_used_for", "")]))
            symptoms.extend(_safe_items(item.get("symptoms", [])))
            red_flags.extend(_safe_items(item.get("red_flags", [])))
            sources.extend(str(source).strip() for source in item.get("sources", []) if str(source).strip())

        return ConditionInfo(
            found=True,
            commonly_used_for="commonly used for " + "; ".join(dict.fromkeys(uses)),
            symptoms=list(dict.fromkeys(symptoms)),
            red_flags=list(dict.fromkeys(red_flags)),
            sources=list(dict.fromkeys(sources)),
        ).model_dump()
    except Exception:
        return ConditionInfo(found=False).model_dump()
