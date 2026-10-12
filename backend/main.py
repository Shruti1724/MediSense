"""main.py - FastAPI application implementing Contract 2 API endpoints.
Owner: Member A.
"""
import os
import uuid
import json
import asyncio
from typing import Dict, Any, Optional, List, Union
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import config
from schemas import (
    Result,
    StartRequest,
    ConfirmRequest,
    AskRequest,
    Step,
    Mode
)
from state import MediSenseState, format_timestamp
from graph import agent_graph, knowledge_retrieval_node, composer_node
from agents.safety import check_emergency, check_dose_request
from agents.home_check import evaluate_home_medicine
from agents.composer import compose_answer_result

# Import make_pdf from fake_tools or tools.knowledge
if config.USE_FAKE_TOOLS:
    from fake_tools import make_pdf, match_medicine, get_drug_info, check_clashes
else:
    try:
        from tools.knowledge import make_pdf, match_medicine, get_drug_info, check_clashes
    except ImportError:
        from fake_tools import make_pdf, match_medicine, get_drug_info, check_clashes

app = FastAPI(
    title="MediSense Agent API",
    description="Prescription and Home Medicine Understanding Agent Backend",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (session_id -> state dict)
SESSIONS: Dict[str, Dict[str, Any]] = {}

@app.get("/")
def read_root():
    return {
        "app": "MediSense Agent API",
        "owner": "Member A (Brain)",
        "mock_mode": config.MOCK_MODE,
        "use_fake_tools": config.USE_FAKE_TOOLS,
        "status": "ready"
    }

# ----------------- 1. POST /start -----------------
@app.post("/start")
async def start_session(
    mode: str = Form("prescription"),
    consent: bool = Form(...),
    typed_name: Optional[str] = Form(None),
    question: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    """
    Initializes a MediSense session. Accepts image file or typed name.
    Runs planner and extraction steps.
    """
    if not consent:
        raise HTTPException(status_code=400, detail="Consent is required to process medicine data.")

    session_id = str(uuid.uuid4())
    image_path = None

    if image and image.filename:
        os.makedirs(config.UPLOADS_DIR, exist_ok=True)
        safe_name = os.path.basename(image.filename)
        save_path = os.path.join(config.UPLOADS_DIR, f"{session_id}_{safe_name}")
        with open(save_path, "wb") as f:
            content = await image.read()
            f.write(content)
        image_path = save_path

    # Initial state
    initial_state: MediSenseState = {
        "session_id": session_id,
        "mode": mode,
        "consent": consent,
        "image_path": image_path,
        "typed_name": typed_name,
        "question": question,
        "steps": [{
            "time": format_timestamp(),
            "agent": "System",
            "action": "Session initiated",
            "result": f"Mode: {mode}, Consent: Granted"
        }],
        "status": "running"
    }

    # Execute graph up to confirmation pause or completion
    final_graph_state = agent_graph.invoke(initial_state)
    SESSIONS[session_id] = final_graph_state

    return {
        "session_id": session_id,
        "mode": mode,
        "status": final_graph_state.get("status"),
        "requires_confirmation": final_graph_state.get("requires_confirmation", False),
        "extracted_medicines": final_graph_state.get("extracted_medicines", []),
        "matches": final_graph_state.get("matches", []),
        "is_blurry": final_graph_state.get("is_blurry", False),
        "result": final_graph_state.get("result")
    }

# Also support JSON body for /start (useful for programmatic tests and text mode)
@app.post("/start/json")
async def start_session_json(req: StartRequest):
    if not req.consent:
        raise HTTPException(status_code=400, detail="Consent is required.")

    session_id = str(uuid.uuid4())
    initial_state: MediSenseState = {
        "session_id": session_id,
        "mode": req.mode,
        "consent": req.consent,
        "image_path": None,
        "typed_name": req.typed_name,
        "question": req.question,
        "steps": [{
            "time": format_timestamp(),
            "agent": "System",
            "action": "Session initiated via JSON",
            "result": f"Mode: {req.mode}"
        }],
        "status": "running"
    }

    final_graph_state = agent_graph.invoke(initial_state)
    SESSIONS[session_id] = final_graph_state

    return {
        "session_id": session_id,
        "mode": req.mode,
        "status": final_graph_state.get("status"),
        "requires_confirmation": final_graph_state.get("requires_confirmation", False),
        "extracted_medicines": final_graph_state.get("extracted_medicines", []),
        "matches": final_graph_state.get("matches", []),
        "result": final_graph_state.get("result")
    }

# ----------------- 2. GET /stream/{id} -----------------
@app.get("/stream/{id}")
async def stream_steps(id: str, request: Request):
    """
    Returns live step log for the session. Supports SSE (text/event-stream)
    or JSON depending on Accept header.
    """
    if id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found.")

    accept = request.headers.get("accept", "")
    session_data = SESSIONS[id]
    steps = session_data.get("steps", [])

    if "text/event-stream" in accept:
        async def event_generator():
            for step in steps:
                yield f"data: {json.dumps(step)}\n\n"
                await asyncio.sleep(0.05)
            yield f"event: done\ndata: {json.dumps({'status': session_data.get('status')})}\n\n"
        return StreamingResponse(event_generator(), media_type="text/event-stream")

    return {"session_id": id, "steps": steps, "status": session_data.get("status")}

# ----------------- 3. POST /confirm/{id} -----------------
@app.post("/confirm/{id}")
async def confirm_medicines(id: str, req: ConfirmRequest):
    """
    Receives user-confirmed or edited medicine list and resumes graph execution.
    """
    if id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found.")

    state = SESSIONS[id]
    
    # Log user confirmation step
    if "steps" not in state or state["steps"] is None:
        state["steps"] = []
    state["steps"].append({
        "time": format_timestamp(),
        "agent": "User Gate",
        "action": "User verified medicine list",
        "result": f"Confirmed {len(req.medicines)} medicine(s)"
    })

    # Update state with confirmed medicines
    state["confirmed_medicines"] = req.medicines
    state["requires_confirmation"] = False

    # Execute knowledge retrieval and composer directly
    knowledge_updates = knowledge_retrieval_node(state)
    state.update(knowledge_updates)

    composer_updates = composer_node(state)
    state.update(composer_updates)

    SESSIONS[id] = state

    return {
        "session_id": id,
        "status": "completed",
        "result": state.get("result")
    }

# ----------------- 4. GET /result/{id} -----------------
@app.get("/result/{id}")
async def get_result(id: str):
    """
    Returns the final schemas.Result object.
    """
    if id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found.")

    state = SESSIONS[id]
    result = state.get("result")
    if not result:
        return JSONResponse(
            status_code=202,
            content={"message": "Result pending or waiting for user confirmation.", "status": state.get("status")}
        )

    return result

# ----------------- 5. GET /result/{id}/pdf -----------------
@app.get("/result/{id}/pdf")
async def get_result_pdf(id: str):
    """
    Generates and returns the PDF summary report for download.
    """
    if id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found.")

    state = SESSIONS[id]
    result = state.get("result")
    if not result:
        raise HTTPException(status_code=400, detail="Cannot generate PDF: result not ready yet.")

    pdf_filename = f"medisense_report_{id}.pdf"
    pdf_path = os.path.join(config.UPLOADS_DIR, pdf_filename)
    
    generated_path = make_pdf(result, path=pdf_path)
    
    if os.path.exists(generated_path):
        return FileResponse(
            generated_path,
            filename=f"MediSense_Report_{id[:8]}.pdf",
            media_type="application/pdf"
        )
    raise HTTPException(status_code=500, detail="Failed to create PDF.")

# ----------------- 6. POST /ask/{id} -----------------
@app.post("/ask/{id}")
async def ask_question(id: str, req: AskRequest):
    """
    Answers user questions ('Can I use this if I have X?', dosage questions, emergency check)
    in the context of the session medicines. Returns a Result (type "answer").
    """
    state = SESSIONS.get(id, {})
    question_text = f"{req.question} {req.situation or ''}".strip()

    # 1. Check emergency keywords
    is_emerg, emerg_msg = check_emergency(question_text)
    if is_emerg:
        res = compose_answer_result(
            question=req.question,
            outcome="emergency",
            warnings=[{"level": "major", "text": "EMERGENCY ALERT: Immediate hospital or emergency medical care required."}],
            sections=[{"title": "Emergency Medical Alert", "body": emerg_msg, "sources": ["Emergency Triage Guidelines"]}]
        )
        return res.model_dump()

    # 2. Check dose alteration
    is_dose, dose_msg = check_dose_request(question_text)
    if is_dose:
        res = compose_answer_result(
            question=req.question,
            outcome="needs_doctor",
            warnings=[{"level": "major", "text": "Do not adjust, double, or skip your dosage without doctor consultation."}],
            sections=[{"title": "Dosage Modification Refusal", "body": dose_msg, "sources": ["Clinical Prescribing Safety"]}]
        )
        return res.model_dump()

    # 3. Contextual evaluation using session medicines or query medicines
    med_names = req.medicines or []
    if not med_names and state:
        confirmed = state.get("confirmed_medicines") or []
        for c in confirmed:
            name = c.get("brand") if isinstance(c, dict) else str(c)
            if name:
                med_names.append(name)
        if not med_names and state.get("matches"):
            med_names = [m.get("brand") for m in state.get("matches", []) if m.get("brand")]

    matches = [match_medicine(name) for name in med_names] if med_names else []
    generics = [m.get("generic") for m in matches if m.get("matched") and m.get("generic")]
    clashes = check_clashes(generics) if len(generics) > 1 else []

    primary_match = matches[0] if matches else {"matched": False}
    primary_generic = primary_match.get("generic")
    drug_info = get_drug_info(primary_generic) if primary_generic else {"found": False}

    eval_res = evaluate_home_medicine(
        medicine_match=primary_match,
        drug_info=drug_info,
        clashes=clashes,
        expiry_info={"is_expired": False},
        situation_or_question=question_text
    )

    answer_res = compose_answer_result(
        question=req.question,
        outcome=eval_res.get("outcome", "ok"),
        warnings=eval_res.get("warnings", []),
        sections=eval_res.get("sections", [])
    )

    return answer_res.model_dump()
