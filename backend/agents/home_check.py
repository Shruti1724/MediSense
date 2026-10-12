"""home_check.py - Evaluator for Mode 2 (Medicine at home) and user inquiries.
Owner: Member A.
"""
from typing import Dict, Any, List, Optional
from schemas import Outcome, ResultWarning, Section
from agents.safety import (
    check_emergency,
    check_dose_request,
    check_special_groups,
    check_antibiotic_or_rx_self_use
)

def evaluate_home_medicine(
    medicine_match: Dict[str, Any],
    drug_info: Dict[str, Any],
    clashes: List[Dict[str, Any]],
    expiry_info: Dict[str, Any],
    situation_or_question: Optional[str] = None
) -> Dict[str, Any]:
    """
    Evaluates a home medicine and an optional user scenario ("can I use this for X?").
    Returns outcome, warnings, and evaluation sections.
    """
    text = (situation_or_question or "").strip()
    warnings: List[ResultWarning] = []
    sections: List[Section] = []

    # 1. Emergency Word Check
    is_emergency, emergency_msg = check_emergency(text)
    if is_emergency:
        return {
            "outcome": "emergency",
            "warnings": [ResultWarning(level="major", text="EMERGENCY ALERT: Immediate hospital or emergency care required.")],
            "sections": [Section(title="Emergency Medical Advice", body=emergency_msg, sources=["Emergency Protocols"])],
            "notes": "Emergency keyword triggered stop."
        }

    # 2. Dose Modification Check
    is_dose_req, dose_msg = check_dose_request(text)
    if is_dose_req:
        return {
            "outcome": "needs_doctor",
            "warnings": [ResultWarning(level="major", text="Do not modify or skip your dosage without a physician's guidance.")],
            "sections": [Section(title="Dose Modification Guidance", body=dose_msg, sources=["Clinical Safety Guidelines"])],
            "notes": "User requested dose adjustment."
        }

    # 3. Medicine Recognition Check
    if not medicine_match.get("matched"):
        return {
            "outcome": "cannot_verify",
            "warnings": [ResultWarning(level="moderate", text="Medicine could not be reliably verified against our database.")],
            "sections": [Section(
                title="Medicine Verification Notice",
                body="I can't verify this medicine from reliable clinical data. Please check the spelling or show the physical packaging to a pharmacist.",
                sources=[]
            )],
            "notes": "Medicine match failed."
        }

    brand = medicine_match.get("brand", "Unknown")
    generic = medicine_match.get("generic", "Unknown")
    drug_type = medicine_match.get("type", "OTC")
    drug_class = medicine_match.get("drug_class", "")
    common_use = medicine_match.get("common_use", "")

    # 4. Expiry Check
    if expiry_info.get("is_expired"):
        warnings.append(ResultWarning(level="major", text=expiry_info.get("warning") or "This medication is expired."))

    # 5. Clash Check
    major_clash_found = False
    for clash in clashes:
        level = clash.get("severity", "moderate")
        if level == "major":
            major_clash_found = True
        warnings.append(ResultWarning(
            level=level,
            text=f"CLASH WARNING: {clash.get('drug_a')} + {clash.get('drug_b')}: {clash.get('note')}"
        ))

    # 6. Special Group Check
    has_special_group, special_groups = check_special_groups(text)
    if has_special_group:
        group_names = ", ".join(special_groups)
        warnings.append(ResultWarning(
            level="major",
            text=f"Special clinical precaution ({group_names}): Needs explicit doctor or pharmacist clearance before use."
        ))

    # 7. Prescription-Only / Antibiotic Misuse Check
    is_rx_misuse, rx_msg = check_antibiotic_or_rx_self_use(drug_type, drug_class, text)
    if is_rx_misuse and text:
        warnings.append(ResultWarning(level="major", text="Prescription-only medication cannot be self-administered."))
        sections.append(Section(title="Prescription Requirement", body=rx_msg, sources=["Antibiotic Stewardship Guidelines"]))
        return {
            "outcome": "needs_doctor",
            "warnings": warnings,
            "sections": sections,
            "notes": "Prescription-only drug requested for self-use."
        }

    # 8. Check Common Use Match if a situation is provided
    # Determine Outcome
    outcome: Outcome = "ok"
    
    if expiry_info.get("is_expired"):
        outcome = "needs_doctor"
    elif major_clash_found:
        outcome = "needs_doctor"
    elif has_special_group:
        outcome = "needs_doctor"
    elif text:
        # User specified a symptom or scenario: evaluate alignment with common_use
        lower_text = text.lower()
        lower_common_use = common_use.lower()
        
        # Check if user scenario keywords match the known common uses
        keywords = [word for word in lower_common_use.replace(",", " ").split() if len(word) > 3]
        matches_use = any(kw in lower_text for kw in keywords)
        
        if matches_use:
            outcome = "ok"
            sections.append(Section(
                title="Common Use Assessment",
                body=f"{brand} ({generic}) is commonly used for {common_use}. Confirm suitability and exact instructions with a pharmacist.",
                sources=drug_info.get("sources", ["Clinical Drug Label"])
            ))
        else:
            outcome = "not_matching"
            sections.append(Section(
                title="Common Use Assessment",
                body=f"Your described situation ('{text}') does not match what {brand} ({generic}) is commonly used for ({common_use}). Please do not take this medication without consulting a pharmacist or doctor.",
                sources=drug_info.get("sources", ["Clinical Drug Label"])
            ))
    else:
        # Default card without situation text
        outcome = "ok"

    # Add primary medicine profile section
    sections.insert(0, Section(
        title=f"Medicine: {brand} ({generic})",
        body=f"**Brand**: {brand} | **Generic**: {generic} | **Type**: {drug_type} ({drug_class})\n\n**Common Use**: Commonly used for {common_use}.",
        sources=["Clinical Drug Database"]
    ))

    # Add core drug information sections from drug_info if found
    if drug_info.get("found"):
        sec_dict = drug_info.get("sections", {})
        for sec_name, content in sec_dict.items():
            if content:
                clean_title = sec_name.replace("_", " ").title()
                sections.append(Section(
                    title=clean_title,
                    body=content,
                    sources=drug_info.get("sources", [])
                ))

    return {
        "outcome": outcome,
        "warnings": warnings,
        "sections": sections,
        "notes": f"Evaluation completed with outcome: {outcome}"
    }
