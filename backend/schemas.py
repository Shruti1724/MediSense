"""schemas.py - the shapes both members agree on. Owner: Member A.
Change only after both members agree and CONTRACT.md is updated."""
from typing import List, Optional, Literal, Dict, Any, Union
from pydantic import BaseModel, Field
from config import DISCLAIMER

Mode = Literal["prescription", "home", "ask"]
Severity = Literal["major", "moderate", "minor"]
ResultType = Literal["prescription_report", "home_medicine", "answer"]
Outcome = Literal["ok", "needs_doctor", "not_matching", "emergency", "cannot_verify"]

# ---------- Contract 1: what B's functions return ----------
class MedicineMatch(BaseModel):
    matched: bool
    brand: Optional[str] = None
    generic: Optional[str] = None
    type: Optional[Literal["OTC", "prescription-only"]] = None
    drug_class: Optional[str] = None
    common_use: Optional[str] = None
    score: float = 0.0
    candidates: List[str] = []          # top 3 guesses when not sure

class DrugInfo(BaseModel):
    found: bool
    # keys: uses, warnings, who_should_avoid, pregnancy, side_effects, interactions
    sections: Dict[str, str] = {}
    sources: List[str] = []

class Clash(BaseModel):
    drug_a: str
    drug_b: str
    severity: Severity
    note: str
    source: str

class ConditionInfo(BaseModel):
    found: bool
    commonly_used_for: Optional[str] = None   # always "commonly used for", never a diagnosis
    symptoms: List[str] = []
    red_flags: List[str] = []
    sources: List[str] = []

class Lifestyle(BaseModel):
    found: bool
    eat: List[str] = []
    avoid: List[str] = []
    rest: List[str] = []
    sources: List[str] = []

# ---------- Contract 2: what the website receives ----------
class ResultWarning(BaseModel):
    level: Severity
    text: str

class Section(BaseModel):
    title: str
    body: str
    sources: List[str] = []

class Result(BaseModel):
    type: ResultType
    outcome: Outcome
    warnings: List[ResultWarning] = []
    sections: List[Section] = []
    disclaimer: str = DISCLAIMER

class Step(BaseModel):
    """One line in the live steps log shown on the website."""
    time: str
    agent: str
    action: str
    result: str

# ---------- API Request / Session shapes ----------
class StartRequest(BaseModel):
    mode: Mode
    consent: bool
    typed_name: Optional[str] = None
    question: Optional[str] = None

class ConfirmRequest(BaseModel):
    medicines: List[Union[str, Dict[str, Any]]]

class AskRequest(BaseModel):
    question: str
    situation: Optional[str] = None
    medicines: Optional[List[str]] = None
    special_group: Optional[str] = None
