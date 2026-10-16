"""llm.py - the ONLY place that talks to Ollama. Owner: Member A.
Everyone else calls ask_text() or ask_vision()."""
from typing import Optional
import json
import config

def ask_text(prompt: str, system: Optional[str] = None) -> str:
    """Send text to the local text model and return its answer as a string."""
    if config.MOCK_MODE:
        return "[MOCK ANSWER] This is a canned reply. Set MOCK_MODE=false to use Ollama."
    try:
        import ollama
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        reply = ollama.chat(model=config.TEXT_MODEL, messages=messages)
        return reply["message"]["content"]
    except Exception as e:
        return f"[Ollama Error: {e}]. Falling back to safe response."

def ask_vision(image_path: str, prompt: str) -> str:
    """Send an image and a prompt to the local vision model. Returns a string."""
    if config.MOCK_MODE:
        filename = (image_path or "").lower()
        if "clear" in filename:
            return (
                '{"medicines": [{"raw": "Tab. Augmentin 625", "brand": "Augmentin 625", '
                '"strength": "625 mg", "frequency": "1-0-1", "duration_days": 5, '
                '"confidence": 0.95}], "expiry": "12/2027"}'
            )
        return '{"medicines": [], "expiry": null}'
    try:
        import ollama
        messages = [{"role": "user", "content": prompt, "images": [image_path]}]
        reply = ollama.chat(model=config.VISION_MODEL, messages=messages)
        return reply["message"]["content"]
    except Exception as e:
        return json.dumps({
            "medicines": [],
            "expiry": None,
            "error": f"Vision model unavailable: {str(e)}"
        })

def ollama_ready() -> bool:
    """True if Ollama is running and reachable (used for a friendly error message)."""
    try:
        import ollama
        ollama.list()
        return True
    except Exception:
        return False
