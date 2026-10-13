"""Deterministic lifestyle lookup from sourced local data, with no LLM call."""
import json
import re
from functools import lru_cache
from pathlib import Path

from schemas import Lifestyle

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "lifestyle.json"
_CONDITIONS_PATH = Path(__file__).resolve().parent.parent / "data" / "conditions.json"
_UNSAFE = re.compile(r"you have|you are suffering|safe for you|\b\d+\s*(?:mg|ml|tablets?|pills?|times?\s+a\s+day)\b", re.IGNORECASE)


def _safe_items(items):
    return [str(item).strip() for item in items if str(item).strip() and not _UNSAFE.search(str(item))]


@lru_cache(maxsize=1)
def _load_lifestyle():
    try:
        payload = json.loads(_DATA_PATH.read_text(encoding="utf-8"))
        return tuple(item for item in payload if isinstance(item, dict)) if isinstance(payload, list) else ()
    except (OSError, UnicodeError, json.JSONDecodeError, TypeError):
        return ()


@lru_cache(maxsize=1)
def _load_conditions():
    try:
        payload = json.loads(_CONDITIONS_PATH.read_text(encoding="utf-8"))
        return tuple(item for item in payload if isinstance(item, dict)) if isinstance(payload, list) else ()
    except (OSError, UnicodeError, json.JSONDecodeError, TypeError):
        return ()


def get_lifestyle(condition: str, generics: list[str]) -> dict:
    try:
        requested = str(condition or "").strip().casefold()
        if not requested:
            return Lifestyle(found=False).model_dump()

        matched = None
        for item in _load_lifestyle():
            condition_item = next((entry for entry in _load_conditions() if entry.get("id") == item.get("id")), {})
            candidates = [item.get("id", ""), item.get("name", ""), condition_item.get("name", ""), condition_item.get("commonly_used_for", "")]
            if any(candidate and (requested in str(candidate).casefold() or str(candidate).casefold() in requested) for candidate in candidates):
                matched = item
                break
        if not matched:
            return Lifestyle(found=False).model_dump()

        sources = list(dict.fromkeys(str(source).strip() for source in matched.get("sources", []) if str(source).strip()))
        return Lifestyle(
            found=True,
            eat=_safe_items(matched.get("eat", [])),
            avoid=_safe_items(matched.get("avoid", [])),
            rest=_safe_items(matched.get("rest", [])),
            sources=sources,
        ).model_dump()
    except Exception:
        return Lifestyle(found=False).model_dump()
