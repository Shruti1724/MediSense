"""config.py - shared settings. Owner: Member A. Everyone imports from here."""
import os

# True  = no Ollama needed, models return canned answers (safe for UI/data work).
# False = real local models through Ollama.
MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"

# True  = use fake_tools.py. B sets this to false once the real tools in
#         backend/tools/knowledge.py exist.
USE_FAKE_TOOLS = os.getenv("USE_FAKE_TOOLS", "true").lower() == "true"

# Same model names on both laptops. Check ollama.com/library if a name fails.
TEXT_MODEL = os.getenv("TEXT_MODEL", "llama3.2")
VISION_MODEL = os.getenv("VISION_MODEL", "qwen2.5vl:3b")

# Embeddings for RAG run through sentence-transformers (no Ollama needed).
EMBED_MODEL = "all-MiniLM-L6-v2"

# A prescription needs a clear photo: blur score below this means "ask for another".
BLUR_THRESHOLD = 100.0

# Name match score (0 to 1) below this means "ask the user to confirm".
MATCH_THRESHOLD = 0.80

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

DISCLAIMER = (
    "MediSense gives general information from verified sources. It is not medical "
    "advice and does not replace a doctor or pharmacist. Always confirm with your "
    "doctor or pharmacist before taking any medicine."
)
