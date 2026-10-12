"""safety.py - Red flag, emergency words, dose guard, and post-generation safety reviewer.
Owner: Member A.
"""
import re
from typing import Tuple, List, Optional, Dict, Any

EMERGENCY_KEYWORDS = [
    r"chest\s+pain",
    r"trouble\s+breathing",
    r"difficulty\s+breathing",
    r"shortness\s+of\s+breath",
    r"severe\s+allergic?\s+reaction",
    r"anaphylaxis",
    r"blood\s+in\s+vomit",
    r"blood\s+in\s+stool",
    r"coughing\s+up\s+blood",
    r"self[- ]harm",
    r"suicid",
    r"loss\s+of\s+consciousness",
    r"fainting\s+repeatedly",
]

DOSE_MODIFICATION_PATTERNS = [
    r"(?:increase|double|change|skip|alter|adjust|lower|decrease|reduce)\s+(?:my\s+)?(?:dose|dosage|tablets?|pills?)",
    r"should\s+i\s+(?:skip|take\s+more|stop|increase|decrease)",
    r"can\s+i\s+take\s+\d+\s+(?:tablets?|pills?|mg)",
]

SPECIAL_GROUP_PATTERNS = {
    "pregnancy / breastfeeding": [r"pregnant", r"pregnancy", r"breastfeeding", r"nursing"],
    "pediatric / child": [r"child", r"infant", r"baby", r"toddler", r"kid", r"under\s+12"],
    "elderly": [r"elderly", r"senior", r"old\s+age", r"80\s+years"],
    "renal / kidney condition": [r"kidney\s+disease", r"kidney\s+failure", r"renal", r"dialysis"],
    "hepatic / liver condition": [r"liver\s+disease", r"cirrhosis", r"liver\s+failure", r"hepatitis"],
}

FORBIDDEN_PHRASES = [
    (r"\byou have\b", "this medicine is commonly used for conditions such as"),
    (r"\bi diagnose\b", "clinical data indicates"),
    (r"\bit is safe for you\b", "confirm suitability with your doctor or pharmacist"),
    (r"\bsafe for you\b", "consult your healthcare provider"),
    (r"\btake (\d+) (tablets?|pills?|mg|ml)\b", "follow the prescribed schedule from your doctor"),
]

def check_emergency(text: str) -> Tuple[bool, Optional[str]]:
    """Checks for emergency phrases requiring immediate medical intervention."""
    if not text:
        return False, None
    lower = text.lower()
    for pattern in EMERGENCY_KEYWORDS:
        if re.search(pattern, lower):
            return True, (
                "EMERGENCY DETECTED: Symptoms such as chest pain, severe breathing difficulty, "
                "or severe allergic symptoms require immediate emergency medical care. "
                "Please call your local emergency medical service or go to the nearest emergency room immediately. "
                "Do not alter, start, or stop medications without direct emergency physician evaluation."
            )
    return False, None

def check_dose_request(text: str) -> Tuple[bool, Optional[str]]:
    """Checks if the user is asking to alter or skip their medicine dosage."""
    if not text:
        return False, None
    lower = text.lower()
    for pattern in DOSE_MODIFICATION_PATTERNS:
        if re.search(pattern, lower):
            return True, (
                "DOSE MODIFICATION REFUSED: MediSense does not provide, calculate, or adjust medication dosages. "
                "Never increase, decrease, or skip your medication doses without explicit instruction "
                "from your prescribing physician or pharmacist. Please contact your doctor for dosage changes."
            )
    return False, None

def check_special_groups(text: str) -> Tuple[bool, List[str]]:
    """Identifies if the user or subject falls into a vulnerable/special clinical group."""
    if not text:
        return False, []
    lower = text.lower()
    matched_groups = []
    for group, patterns in SPECIAL_GROUP_PATTERNS.items():
        for pat in patterns:
            if re.search(pat, lower):
                matched_groups.append(group)
                break
    return len(matched_groups) > 0, matched_groups

def check_antibiotic_or_rx_self_use(drug_type: Optional[str], drug_class: Optional[str], situation: str) -> Tuple[bool, Optional[str]]:
    """
    Detects if user is asking to use leftover or prescription-only medicines (e.g. antibiotics)
    for self-medication (e.g. common cold, cough).
    """
    if not situation:
        return False, None
    
    is_rx = (drug_type == "prescription-only") or (drug_class and "antibiotic" in drug_class.lower())
    if is_rx:
        return True, (
            "PRESCRIPTION-ONLY MEDICATION: This is a prescription-only drug. "
            "Antibiotics and prescription medicines must NEVER be used for self-medication or repurposed "
            "for common symptoms like colds or viral infections without a fresh doctor's prescription. "
            "Please consult your doctor."
        )
    return False, None

def sanitize_and_review(text: str) -> Tuple[bool, List[str], str]:
    """
    Post-generation safety reviewer (self-check pass).
    Scans text for forbidden phrasing (diagnoses, dosage instructions, 'safe for you'),
    flags violations, and substitutes safe wording.
    """
    violations = []
    sanitized = text
    for pattern, replacement in FORBIDDEN_PHRASES:
        if re.search(pattern, sanitized, re.IGNORECASE):
            violations.append(f"Safety rule violation caught: matched '{pattern}'")
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)
            
    return len(violations) > 0, violations, sanitized
