# MediSense CONTRACT (both members must agree before changing anything)

Place in the repo root. The five starter files live like this:
```
CONTRACT.md
backend/config.py
backend/schemas.py
backend/llm.py
backend/fake_tools.py
```

## 1. Who owns what
- **Member A (brain)**: `main.py`, `graph.py`, `state.py`, `config.py`, `llm.py`, `schemas.py`, `agents/` (`extraction.py`, `safety.py`, `home_check.py`, `composer.py`), `tools/vision.py`, `tools/expiry.py`.
- **Member B (knowledge + screens)**: `data/`, `frontend/`, `fake_tools.py`, `tools/knowledge.py` (real functions), `agents/condition.py`, `agents/lifestyle.py`, `PDF`.

*Nobody edits the other member's files. Ask by message instead.*

## 2. Contract 1: functions B writes, A calls (same names, same shapes as fake_tools.py)
- `match_medicine(name) -> MedicineMatch`:
  `matched`, `brand`, `generic`, `type` (OTC | prescription-only), `drug_class`, `common_use`, `score` (0 to 1), `candidates` (top 3 names)
- `get_drug_info(generic) -> DrugInfo`:
  `found`, `sections` {`uses`, `warnings`, `who_should_avoid`, `pregnancy`, `side_effects`, `interactions`}, `sources`
- `check_clashes(generics) -> list of Clash`:
  `drug_a`, `drug_b`, `severity` (major | moderate | minor), `note`, `source`
- `get_condition_info(drug_classes) -> ConditionInfo`:
  `found`, `commonly_used_for`, `symptoms`, `red_flags`, `sources`
- `get_lifestyle(condition, generics) -> Lifestyle`:
  `found`, `eat`, `avoid`, `rest`, `sources`
- `make_pdf(result) -> file path (string)`

Rules:
1. Nothing found means `found = false` (never an error, never a guess).
2. Every answer that has content carries sources.
3. Functions return plain dicts (use `.model_dump()` on the schema classes).

How A imports them (works for fake and real, flip with `USE_FAKE_TOOLS`):
```python
from config import USE_FAKE_TOOLS
if USE_FAKE_TOOLS:
    from fake_tools import (
        match_medicine, get_drug_info, check_clashes,
        get_condition_info, get_lifestyle, make_pdf
    )
else:
    from tools.knowledge import (
        match_medicine, get_drug_info, check_clashes,
        get_condition_info, get_lifestyle, make_pdf
    )
```

## 3. Contract 2: API that A builds and B's website calls
- `POST /start`: body: mode (prescription | home | ask), consent (true), image or typed_name. Returns session_id.
- `GET  /stream/{id}`: live step log, each item: time, agent, action, result (Step).
- `POST /confirm/{id}`: body: the user-edited medicine list. The agent continues.
- `GET  /result/{id}`: the final Result.
- `GET  /result/{id}/pdf`: PDF download.
- `POST /ask/{id}`: body: question or situation text. Returns a Result (type "answer").

## 4. The one result shape the website draws (schemas.Result)
- `type`: `prescription_report` | `home_medicine` | `answer`
- `outcome`: `ok` | `needs_doctor` | `not_matching` | `emergency` | `cannot_verify`
- `warnings`: list of `{level: major | moderate | minor, text}`
- `sections`: list of `{title, body, sources}`
- `disclaimer`: always present (default text is in `config.DISCLAIMER`)

Outcome meaning:
- `ok`: label says it is commonly used for this; confirm with a pharmacist
- `not_matching`: does not match what the medicine is used for; ask a pharmacist
- `needs_doctor`: special group or clash; ask a doctor or pharmacist first
- `emergency`: get medical help now, nothing else
- `cannot_verify`: medicine or info not found in our verified data

## 5. Safety wording (both members use it)
- Never "you have X". Always "commonly used for".
- Never a dose, never "it is safe for you", never a new medicine.

## 6. Working rules
- `MOCK_MODE=true` runs without Ollama. `MOCK_MODE=false` uses real models.
- Git: own branch each (`member-a`, `member-b`). Pull `main` every morning. Merge to `main` every evening only after the daily checkpoint passes. Never push broken code to `main`.
- Contract change: message first, edit this file, then change code.
