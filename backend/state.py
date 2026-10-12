"""state.py - LangGraph Agent State definition for MediSense.
Owner: Member A.
"""
from typing import TypedDict, List, Dict, Any, Optional
from datetime import datetime

def format_timestamp() -> str:
    return datetime.now().strftime("%H:%M:%S")

class MediSenseState(TypedDict, total=False):
    # Session identifiers & user inputs
    session_id: str
    mode: str                         # "prescription" | "home" | "ask"
    consent: bool
    image_path: Optional[str]
    typed_name: Optional[str]
    question: Optional[str]
    
    # Pre-processing & safety flags
    blur_score: float
    is_blurry: bool
    injection_detected: bool
    is_emergency: bool
    emergency_message: Optional[str]
    
    # Extraction & user confirmation
    extracted_medicines: List[Dict[str, Any]]
    requires_confirmation: bool
    confirmed_medicines: List[Dict[str, Any]]
    expiry_info: Dict[str, Any]
    
    # Knowledge retrieval
    matches: List[Dict[str, Any]]
    drug_infos: Dict[str, Dict[str, Any]]
    clashes: List[Dict[str, Any]]
    condition_info: Dict[str, Any]
    lifestyle_info: Dict[str, Any]
    
    # Mode 2 / Evaluation
    evaluation: Dict[str, Any]
    
    # Final artifacts
    result: Optional[Dict[str, Any]]
    steps: List[Dict[str, Any]]       # list of {time, agent, action, result}
    status: str                       # "init", "waiting_confirmation", "completed", "emergency", "error"
