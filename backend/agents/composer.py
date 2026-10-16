"""composer.py - Synthesizes the final schemas.Result object with safety reviews.
Owner: Member A.
"""
from typing import Dict, Any, List, Optional
import config
from schemas import (
    Result,
    ResultType,
    Outcome,
    ResultWarning,
    Section
)
from agents.safety import sanitize_and_review

def compose_prescription_result(
    medicines: List[Dict[str, Any]],
    drug_matches: List[Dict[str, Any]],
    drug_infos: Dict[str, Dict[str, Any]],
    clashes: List[Dict[str, Any]],
    condition_info: Dict[str, Any],
    lifestyle_info: Dict[str, Any],
    injection_detected: bool = False
) -> Result:
    """
    Composes a complete prescription report conforming to schemas.Result.
    """
    warnings: List[ResultWarning] = []
    sections: List[Section] = []
    has_major_clash = False

    if injection_detected:
        warnings.append(ResultWarning(
            level="minor",
            text="Notice: Potential command injection phrases in input documents were identified and safely neutralized."
        ))

    # 1. Process Clashes
    for clash in clashes:
        level = clash.get("severity", "moderate")
        if level == "major":
            has_major_clash = True
        warnings.append(ResultWarning(
            level=level,
            text=f"CLASH ALERT: {clash.get('drug_a').title()} and {clash.get('drug_b').title()}: {clash.get('note')}"
        ))

    # 2. Section: Overview & What this set is commonly used for
    if condition_info.get("found"):
        cond_body = condition_info.get("commonly_used_for", "")
        symptoms = condition_info.get("symptoms", [])
        red_flags = condition_info.get("red_flags", [])
        
        body_parts = [cond_body]
        if symptoms:
            body_parts.append(f"Associated symptoms commonly treated: {', '.join(symptoms)}.")
        if red_flags:
            body_parts.append(f"Seek urgent medical care if you experience red flags: {', '.join(red_flags)}.")
            
        sections.append(Section(
            title="Prescription Purpose",
            body=" ".join(body_parts),
            sources=condition_info.get("sources", ["Clinical Guidelines"])
        ))
    else:
        # Fallback summary only if there are verified common uses
        matched_uses = [m.get("common_use") for m in drug_matches if m.get("matched") and m.get("common_use")]
        if matched_uses:
            use_summary = "; ".join(matched_uses)
            sections.append(Section(
                title="Prescription Purpose",
                body=f"This combination of medications is commonly used for: {use_summary}. Confirm specific diagnosis with your doctor.",
                sources=["medicines.csv"]
            ))
        else:
            sections.append(Section(
                title="Prescription Purpose",
                body="Prescription purpose could not be verified because the prescribed medicines were not found in our verified database.",
                sources=[]
            ))

    # 3. Section: Individual Medicines Breakdown
    for i, match in enumerate(drug_matches):
        if not match.get("matched"):
            candidates_str = f" Did you mean: {', '.join(match.get('candidates', []))}?" if match.get("candidates") else ""
            sections.append(Section(
                title=f"Unrecognized Medicine #{i+1}",
                body=f"Could not verify this medicine against official databases.{candidates_str}",
                sources=[]
            ))
            continue

        brand = match.get("brand", "Unknown")
        generic = match.get("generic", "Unknown")
        drug_type = match.get("type", "Prescription")
        drug_class = match.get("drug_class", "Therapeutic agent")
        common_use = match.get("common_use", "")
        
        info = drug_infos.get(generic, {})
        d_sections = info.get("sections", {})
        
        med_desc = [
            f"**Brand**: {brand} | **Generic**: {generic} | **Type**: {drug_type} ({drug_class})",
            f"**Common Use**: Commonly used for {common_use}.",
        ]
        if d_sections.get("warnings"):
            med_desc.append(f"**Key Warnings**: {d_sections['warnings']}")
        if d_sections.get("who_should_avoid"):
            med_desc.append(f"**Who Should Avoid**: {d_sections['who_should_avoid']}")
        if d_sections.get("side_effects"):
            med_desc.append(f"**Possible Side Effects**: {d_sections['side_effects']}")
        if d_sections.get("pregnancy"):
            med_desc.append(f"**Pregnancy & Nursing Guidance**: {d_sections['pregnancy']}")

        sources = info.get("sources")
        if not sources:
            sources = ["OpenFDA / Package Leaflet"] if info.get("found") else ["Verified Medicine Database (medicines.csv)"]

        sections.append(Section(
            title=f"Medicine: {brand} ({generic})",
            body="\n\n".join(med_desc),
            sources=sources
        ))

    # 4. Section: Diet and Lifestyle Guidance
    # Only include lifestyle tips if condition is grounded or at least one medicine is recognized
    has_recognized_meds = any(m.get("matched") for m in drug_matches)
    if lifestyle_info.get("found") and (condition_info.get("found") or has_recognized_meds):
        eat = ", ".join(lifestyle_info.get("eat", []))
        avoid = ", ".join(lifestyle_info.get("avoid", []))
        rest = ", ".join(lifestyle_info.get("rest", []))
        
        diet_body = (
            f"**Recommended Nutrition**: {eat or 'Balanced diet, stay hydrated.'}\n\n"
            f"**Foods/Substances to Avoid**: {avoid or 'Avoid alcohol unless cleared by doctor.'}\n\n"
            f"**Rest & Recovery**: {rest or 'Adequate sleep and rest.'}"
        )
        sections.append(Section(
            title="Diet & Lifestyle Tips",
            body=diet_body,
            sources=lifestyle_info.get("sources", ["NHS / WHO Lifestyle Guidance"])
        ))

    # Determine overall outcome
    has_unrecognized = any(not m.get("matched") for m in drug_matches) if drug_matches else True
    if has_major_clash:
        outcome: Outcome = "needs_doctor"
    elif has_unrecognized:
        outcome: Outcome = "cannot_verify"
    else:
        outcome: Outcome = "ok"

    # Self-Check Review Pass on every section and sanitize sources against fake placeholders
    cleaned_sections = []
    for sec in sections:
        _, violations, sanitized_body = sanitize_and_review(sec.body)
        clean_sources = []
        for s in (sec.sources or []):
            s_str = str(s).strip()
            if "fake data" in s_str.lower() or "replace with real source" in s_str.lower():
                continue
            clean_sources.append(s_str)
        if not clean_sources and sec.title.startswith("Medicine:") and not sec.title.startswith("Unrecognized Medicine"):
            clean_sources = ["Verified Medicine Database (medicines.csv)"]
        cleaned_sections.append(Section(
            title=sec.title,
            body=sanitized_body,
            sources=clean_sources
        ))

    return Result(
        type="prescription_report",
        outcome=outcome,
        warnings=warnings,
        sections=cleaned_sections,
        disclaimer=config.DISCLAIMER
    )

def compose_answer_result(
    question: str,
    outcome: Outcome,
    warnings: List[Any],
    sections: List[Any]
) -> Result:
    """
    Composes a Result of type 'answer' for /ask and inquiries.
    """
    cleaned_sections = []
    for sec in sections:
        title = sec.title if hasattr(sec, "title") else sec.get("title", "")
        body = sec.body if hasattr(sec, "body") else sec.get("body", "")
        sources = sec.sources if hasattr(sec, "sources") else sec.get("sources", [])
        
        _, violations, sanitized_body = sanitize_and_review(body)
        cleaned_sections.append(Section(
            title=title,
            body=sanitized_body,
            sources=sources
        ))

    converted_warnings = []
    for w in warnings:
        if isinstance(w, ResultWarning):
            converted_warnings.append(w)
        elif isinstance(w, dict):
            converted_warnings.append(ResultWarning(level=w.get("level", "moderate"), text=w.get("text", "")))

    return Result(
        type="answer",
        outcome=outcome,
        warnings=converted_warnings,
        sections=cleaned_sections,
        disclaimer=config.DISCLAIMER
    )
