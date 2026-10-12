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
    try:
        # Direct parse attempt
        return json.loads(text.strip())
    except Exception:
        pass
    
    # Try finding markdown code block ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except Exception:
            pass
            
    # Try finding outermost { ... }
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0).strip())
        except Exception:
            pass
            
    return {"medicines": [], "expiry": None, "raw_text": text}
