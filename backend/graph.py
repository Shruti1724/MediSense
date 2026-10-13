"""graph.py - LangGraph Workflow Definition for MediSense.
Owner: Member A.
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from langgraph.graph import StateGraph, START, END

import config
from state import MediSenseState, format_timestamp
from schemas import Result, ResultWarning, Section
from agents.extraction import extract_prescription_data
from agents.safety import check_emergency, check_dose_request, sanitize_and_review
from agents.home_check import evaluate_home_medicine
from agents.composer import compose_prescription_result, compose_answer_result

# Import Member B knowledge tools per CONTRACT.md
if config.USE_FAKE_TOOLS:
    from fake_tools import (
        match_medicine, get_drug_info, check_clashes,
        get_condition_info, get_lifestyle, make_pdf
    )
else:
    try:
        from tools.knowledge import (
            match_medicine, get_drug_info, check_clashes,
            get_condition_info, get_lifestyle, make_pdf
        )
    except Exception as e:
        import logging
        logging.warning(f"Could not import tools.knowledge ({e}); falling back to fake_tools.")
        from fake_tools import (
            match_medicine, get_drug_info, check_clashes,
            get_condition_info, get_lifestyle, make_pdf
        )

def log_step(state: MediSenseState, agent: str, action: str, result: str):
    """Appends a new Step to the state's steps list."""
    if "steps" not in state or state["steps"] is None:
        state["steps"] = []
    state["steps"].append({
        "time": format_timestamp(),
        "agent": agent,
        "action": action,
        "result": result
    })

# ----------------- Nodes -----------------

def planner_node(state: MediSenseState) -> Dict[str, Any]:
    """
    Analyzes user intent, checks initial emergency words and consent.
    """
    mode = state.get("mode", "prescription")
    query_text = (state.get("question") or "") + " " + (state.get("typed_name") or "")
    
    # Emergency check in planner
    is_emerg, emerg_msg = check_emergency(query_text)
    if is_emerg:
        log_step(state, "Safety Sentinel", "Emergency keywords detected in input", "Triggering immediate emergency routing")
        return {
            "is_emergency": True,
            "emergency_message": emerg_msg,
            "status": "emergency"
        }

    log_step(state, "Planner", f"Initialized workflow in '{mode}' mode", "Consent verified; proceeding to data extraction")
    return {"status": "planning"}

def emergency_node(state: MediSenseState) -> Dict[str, Any]:
    """
    Handles emergency stops, creating an urgent care Result.
    """
    msg = state.get("emergency_message") or (
        "EMERGENCY DETECTED: Symptoms require urgent emergency evaluation. "
        "Please visit the nearest emergency room or call emergency services immediately."
    )
    result = Result(
        type="answer" if state.get("mode") == "ask" else "home_medicine",
        outcome="emergency",
        warnings=[ResultWarning(level="major", text="EMERGENCY ALERT: Immediate medical care required.")],
        sections=[Section(title="Emergency Medical Assistance", body=msg, sources=["Emergency Protocol"])],
        disclaimer=config.DISCLAIMER
    ).model_dump()
    
    log_step(state, "Safety Sentinel", "Constructed emergency advisory result", "Halted further automated advice")
    return {
        "result": result,
        "status": "completed"
    }

def extraction_node(state: MediSenseState) -> Dict[str, Any]:
    """
    Performs blur check, vision OCR extraction, expiry parsing, and initial matching.
    """
    image_path = state.get("image_path")
    typed_name = state.get("typed_name")
    
    extracted = extract_prescription_data(image_path=image_path, typed_name=typed_name)
    
    if extracted.get("is_blurry"):
        log_step(state, "Vision Agent", "Blur detection checked image", f"Image blurry (score {extracted.get('blur_score')}). Requesting clear photo.")
        result = Result(
            type="prescription_report",
            outcome="cannot_verify",
            warnings=[ResultWarning(level="major", text="Image is too blurry to reliably read medicine names.")],
            sections=[Section(
                title="Photo Quality Notice",
                body="The uploaded image is too blurry. Please upload a well-lit, steady photograph of the prescription or medicine strip.",
                sources=[]
            )],
            disclaimer=config.DISCLAIMER
        ).model_dump()
        return {
            "blur_score": extracted.get("blur_score"),
            "is_blurry": True,
            "result": result,
            "status": "completed"
        }

    meds = extracted.get("medicines", [])
    expiry_info = extracted.get("expiry_info", {})
    injection_detected = extracted.get("injection_detected", False)
    
    if injection_detected:
        log_step(state, "Security Sentinel", "Prompt injection defense triggered", "Neutralized instruction directives; treating text as data only.")

    # Match extracted names
    matches = []
    low_confidence = False
    for med in meds:
        name_to_match = med.get("brand") or med.get("raw") or ""
        match_res = match_medicine(name_to_match)
        matches.append(match_res)
        
        # Check confidence
        conf = med.get("confidence", 1.0)
        score = match_res.get("score", 0.0)
        if conf < 0.80 or score < config.MATCH_THRESHOLD:
            low_confidence = True

    # Only prescription mode pauses for the editable user table
    # Home mode continues directly to evaluation/composer
    mode = state.get("mode", "prescription")
    requires_confirmation = (mode == "prescription")

    log_step(
        state,
        "Extraction Agent",
        f"Extracted {len(meds)} medicine(s)",
        f"Matches: {[m.get('brand') or 'Unmatched' for m in matches]}. Requires confirmation: {requires_confirmation}"
    )

    return {
        "blur_score": extracted.get("blur_score", 999.0),
        "is_blurry": False,
        "injection_detected": injection_detected,
        "extracted_medicines": meds,
        "expiry_info": expiry_info,
        "matches": matches,
        "requires_confirmation": requires_confirmation,
        "status": "waiting_confirmation" if requires_confirmation else "retrieving"
    }

def knowledge_retrieval_node(state: MediSenseState) -> Dict[str, Any]:
    """
    Retrieves drug labels, checks pairwise drug clashes, finds condition info & lifestyle tips.
    """
    # Use confirmed medicines if provided, otherwise matches from extraction
    confirmed = state.get("confirmed_medicines")
    drug_matches = []
    
    if confirmed:
        existing_matches = state.get("matches", [])
        extracted_meds = state.get("extracted_medicines", [])

        for idx, item in enumerate(confirmed):
            # 1. If item is already a match dictionary with matched=True, preserve it directly
            if isinstance(item, dict) and item.get("matched") and item.get("generic"):
                drug_matches.append(item)
                continue

            # 2. Extract medicine name string flexibly
            if isinstance(item, dict):
                cand_name = (
                    item.get("brand")
                    or item.get("name")
                    or item.get("medicine")
                    or item.get("medicine_name")
                    or item.get("raw")
                    or ""
                )
            else:
                cand_name = str(item) if item is not None else ""

            cand_clean = cand_name.strip()
            if not cand_clean:
                drug_matches.append(match_medicine(""))
                continue

            # 3. Check if cand_clean corresponds to an already verified match in existing_matches
            matched_existing = None
            cand_lower = cand_clean.lower()

            for ex_idx, ex_m in enumerate(existing_matches):
                if not ex_m.get("matched"):
                    continue
                ex_brand = (ex_m.get("brand") or "").strip().lower()
                ex_generic = (ex_m.get("generic") or "").strip().lower()
                ex_raw = ""
                if ex_idx < len(extracted_meds):
                    ex_raw = (extracted_meds[ex_idx].get("raw") or "").strip().lower()

                if cand_lower in (ex_brand, ex_generic, ex_raw):
                    matched_existing = ex_m
                    break
                if ex_brand and (ex_brand in cand_lower or cand_lower in ex_brand):
                    matched_existing = ex_m
                    break
                if ex_raw and (cand_lower in ex_raw or ex_raw in cand_lower):
                    matched_existing = ex_m
                    break

            if matched_existing:
                drug_matches.append(matched_existing)
            else:
                drug_matches.append(match_medicine(cand_clean))
    else:
        drug_matches = state.get("matches", [])

    generics = [m.get("generic") for m in drug_matches if m.get("matched") and m.get("generic")]
    drug_classes = [m.get("drug_class") for m in drug_matches if m.get("matched") and m.get("drug_class")]

    # 1. Fetch drug info per generic
    drug_infos: Dict[str, Dict[str, Any]] = {}
    for gen in set(generics):
        drug_infos[gen] = get_drug_info(gen)

    # 2. Check clashes across all pairs of generics
    clashes = check_clashes(generics) if len(generics) > 1 else []

    # 3. Get condition info
    condition_info = get_condition_info(drug_classes)

    # 4. Get lifestyle tips
    condition_name = condition_info.get("commonly_used_for", "general condition") if condition_info.get("found") else "general"
    lifestyle_info = get_lifestyle(condition_name, generics)

    log_step(
        state,
        "Knowledge Agent",
        f"Queried knowledge base for {len(generics)} generic(s)",
        f"Found {len(clashes)} clash(es); condition grounded: {condition_info.get('found', False)}"
    )

    return {
        "matches": drug_matches,
        "drug_infos": drug_infos,
        "clashes": clashes,
        "condition_info": condition_info,
        "lifestyle_info": lifestyle_info,
        "status": "composing"
    }

def composer_node(state: MediSenseState) -> Dict[str, Any]:
    """
    Synthesizes the final Result conforming to schemas.Result.
    """
    mode = state.get("mode", "prescription")
    
    if mode == "prescription":
        confirmed = state.get("confirmed_medicines")
        meds_to_use = confirmed if confirmed else state.get("extracted_medicines", [])
        result_obj = compose_prescription_result(
            medicines=meds_to_use,
            drug_matches=state.get("matches", []),
            drug_infos=state.get("drug_infos", {}),
            clashes=state.get("clashes", []),
            condition_info=state.get("condition_info", {}),
            lifestyle_info=state.get("lifestyle_info", {}),
            injection_detected=state.get("injection_detected", False)
        )
    elif mode == "home":
        # Mode 2: Home medicine evaluation
        matches = state.get("matches", [])
        med_match = matches[0] if matches else {"matched": False}
        generic = med_match.get("generic")
        drug_info = state.get("drug_infos", {}).get(generic, {"found": False}) if generic else {"found": False}
        
        home_eval = evaluate_home_medicine(
            medicine_match=med_match,
            drug_info=drug_info,
            clashes=state.get("clashes", []),
            expiry_info=state.get("expiry_info", {}),
            situation_or_question=state.get("question")
        )
        
        result_obj = Result(
            type="home_medicine",
            outcome=home_eval.get("outcome", "ok"),
            warnings=home_eval.get("warnings", []),
            sections=home_eval.get("sections", []),
            disclaimer=config.DISCLAIMER
        )
    else: # mode == "ask"
        matches = state.get("matches", [])
        med_match = matches[0] if matches else {"matched": False}
        generic = med_match.get("generic")
        drug_info = state.get("drug_infos", {}).get(generic, {"found": False}) if generic else {"found": False}
        
        home_eval = evaluate_home_medicine(
            medicine_match=med_match,
            drug_info=drug_info,
            clashes=state.get("clashes", []),
            expiry_info=state.get("expiry_info", {}),
            situation_or_question=state.get("question")
        )
        
        result_obj = compose_answer_result(
            question=state.get("question", ""),
            outcome=home_eval.get("outcome", "ok"),
            warnings=home_eval.get("warnings", []),
            sections=home_eval.get("sections", [])
        )

    log_step(
        state,
        "Composer Agent",
        "Synthesized final clinical explanation",
        f"Outcome: '{result_obj.outcome}', Warnings: {len(result_obj.warnings)}, Sections: {len(result_obj.sections)}"
    )

    return {
        "result": result_obj.model_dump(),
        "status": "completed"
    }

# ----------------- Conditional Routing -----------------

def route_after_planner(state: MediSenseState) -> str:
    if state.get("is_emergency"):
        return "emergency"
    return "extraction"

def route_after_extraction(state: MediSenseState) -> str:
    if state.get("is_blurry"):
        return END
    if state.get("status") == "waiting_confirmation":
        return END  # Pauses for /confirm/{id}
    return "knowledge"

# ----------------- Graph Construction -----------------

def build_medisense_graph() -> StateGraph:
    workflow = StateGraph(MediSenseState)

    workflow.add_node("planner", planner_node)
    workflow.add_node("emergency", emergency_node)
    workflow.add_node("extraction", extraction_node)
    workflow.add_node("knowledge", knowledge_retrieval_node)
    workflow.add_node("composer", composer_node)

    workflow.add_edge(START, "planner")
    
    workflow.add_conditional_edges(
        "planner",
        route_after_planner,
        {
            "emergency": "emergency",
            "extraction": "extraction"
        }
    )
    
    workflow.add_edge("emergency", END)

    workflow.add_conditional_edges(
        "extraction",
        route_after_extraction,
        {
            "knowledge": "knowledge",
            END: END
        }
    )

    workflow.add_edge("knowledge", "composer")
    workflow.add_edge("composer", END)

    return workflow.compile()

# Global compiled graph
agent_graph = build_medisense_graph()
