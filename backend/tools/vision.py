"""vision.py - Vision and blur detection tools. Owner: Member A."""
import os
import cv2
import json
import re
from typing import Tuple, Dict, Any, List
import config
from llm import ask_vision

def check_blur(image_path: str) -> Tuple[float, bool]:
    """
    Computes image blurriness using OpenCV's Laplacian variance method.
    Returns (score, is_blurry).
    If score < BLUR_THRESHOLD, the image is considered blurry.
    """
    if not image_path or not os.path.exists(image_path):
        return 0.0, True
    
    try:
        image = cv2.imread(image_path)
        if image is None:
            return 0.0, True
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        score = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = score < config.BLUR_THRESHOLD
        return round(score, 2), is_blurry
    except Exception as e:
        print(f"Error checking blur: {e}")
        return 0.0, True

def extract_json_from_text(text: str) -> Dict[str, Any]:
    """Helper to extract and parse JSON object from LLM response text."""
    if not text or not str(text).strip():
        return {"medicines": [], "expiry": None, "raw_text": ""}
    
    clean_text = text.strip()
    try:
        # Direct parse attempt
        parsed = json.loads(clean_text)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass
    
    # Try finding markdown code block ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", clean_text)
    if match:
        try:
            parsed = json.loads(match.group(1).strip())
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass
            
    # Try finding outermost { ... } with array repair
    match = re.search(r"\{[\s\S]*\}", clean_text)
    if match:
        raw_json = match.group(0).strip()
        try:
            parsed = json.loads(raw_json)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            # Repair malformed array concatenation like `], [` -> `, `
            try:
                repaired = re.sub(r"\]\s*,\s*\[", ", ", raw_json)
                parsed = json.loads(repaired)
                if isinstance(parsed, dict):
                    return parsed
            except Exception:
                pass

    # Salvage individual medicine JSON objects matching {"raw": ..., "brand": ...}
    med_objs = []
    for m in re.finditer(r"\{[^{}]*\"(?:brand|raw)\"[^{}]*\}", clean_text):
        try:
            obj = json.loads(m.group(0))
            if isinstance(obj, dict) and (obj.get("brand") or obj.get("raw")):
                med_objs.append(obj)
        except Exception:
            pass
    if med_objs:
        return {"medicines": med_objs, "expiry": None}
            
    return {"medicines": [], "expiry": None, "raw_text": clean_text}
