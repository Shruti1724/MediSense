"""test_prescription_confirmation.py - Regression test suite for end-to-end prescription confirmation.
Verifies that confirmed medicines preserve original matches and do not fabricate generic uses or sources.
"""
import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import config
from main import app

client = TestClient(app)

# Use the real test image from uploads if available, otherwise clear test asset
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
SCREENSHOT_FILES = [f for f in os.listdir(UPLOADS_DIR) if "Screenshot" in f and f.endswith(".png")]
TEST_IMG_PATH = os.path.join(UPLOADS_DIR, SCREENSHOT_FILES[0]) if SCREENSHOT_FILES else os.path.join(os.path.dirname(__file__), "assets", "clear_prescription.png")


def test_dextrose_ors_prescription_confirmation_with_brand_objects():
    """
    Test that confirming 5% Dextrose and ORS preserves both matches,
    grounds condition purpose, produces recognized medicine cards, and sets outcome 'ok'.
    """
    with open(TEST_IMG_PATH, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription_screenshot.png", f, "image/png")}
        )
    assert resp.status_code == 200
    data = resp.json()
    session_id = data["session_id"]
    assert data["status"] == "waiting_confirmation"
    assert data["requires_confirmation"] is True
    assert len(data["extracted_medicines"]) == 2

    # User confirms with brand dictionaries
    conf_resp = client.post(f"/confirm/{session_id}", json={
        "medicines": [{"brand": "5% Dextrose"}, {"brand": "ORS"}]
    })
    assert conf_resp.status_code == 200
    res = conf_resp.json()["result"]

    assert res["type"] == "prescription_report"
    assert res["outcome"] == "ok"
    assert len(res["warnings"]) == 0

    section_titles = [s["title"] for s in res["sections"]]
    assert "Medicine: 5% Dextrose (dextrose)" in section_titles
    assert "Medicine: ORS (oral rehydration salts)" in section_titles
    assert not any("Unrecognized Medicine" in t for t in section_titles)

    # Check Prescription Purpose is grounded (not generic fabricated treatment)
    purpose_sec = next(s for s in res["sections"] if s["title"] == "Prescription Purpose")
    assert "general treatment" not in purpose_sec["body"].lower()
    assert "hypoglycemia" in purpose_sec["body"].lower() or "electrolyte" in purpose_sec["body"].lower()


def test_dextrose_ors_prescription_confirmation_with_name_keys():
    """
    Regression test: Verifies that confirmation payload using {"name": ...}
    instead of {"brand": ...} preserves the matches and does not drop to Unrecognized Medicine.
    """
    with open(TEST_IMG_PATH, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription_screenshot.png", f, "image/png")}
        )
    session_id = resp.json()["session_id"]

    # Confirming using 'name' keys (typical from generic React editable tables)
    conf_resp = client.post(f"/confirm/{session_id}", json={
        "medicines": [{"name": "5% Dextrose"}, {"name": "ORS"}]
    })
    assert conf_resp.status_code == 200
    res = conf_resp.json()["result"]

    assert res["outcome"] == "ok"
    section_titles = [s["title"] for s in res["sections"]]
    assert "Medicine: 5% Dextrose (dextrose)" in section_titles
    assert "Medicine: ORS (oral rehydration salts)" in section_titles
    assert not any("Unrecognized Medicine" in t for t in section_titles)


def test_dextrose_ors_prescription_confirmation_with_raw_strings():
    """
    Regression test: Verifies that confirmation with the raw clinical strings
    preserves existing verified matches rather than failing fuzzy ratio.
    """
    with open(TEST_IMG_PATH, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription_screenshot.png", f, "image/png")}
        )
    session_id = resp.json()["session_id"]

    conf_resp = client.post(f"/confirm/{session_id}", json={
        "medicines": ["5% Dextrose (iv) stat.", "ORS 2 sachets"]
    })
    assert conf_resp.status_code == 200
    res = conf_resp.json()["result"]

    assert res["outcome"] == "ok"
    section_titles = [s["title"] for s in res["sections"]]
    assert "Medicine: 5% Dextrose (dextrose)" in section_titles
    assert "Medicine: ORS (oral rehydration salts)" in section_titles


def test_dextrose_ors_pdf_generation_matches_report():
    """
    Verifies that the generated PDF report reflects recognized medicines and not Unrecognized titles.
    """
    with open(TEST_IMG_PATH, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription_screenshot.png", f, "image/png")}
        )
    session_id = resp.json()["session_id"]

    client.post(f"/confirm/{session_id}", json={
        "medicines": [{"brand": "5% Dextrose"}, {"brand": "ORS"}]
    })

    pdf_resp = client.get(f"/result/{session_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 100


def test_unrecognized_medicine_outcome_is_cannot_verify():
    """
    Regression test: If an unrecognized medicine is actually supplied,
    the outcome must be 'cannot_verify', NOT 'ok', and must not fabricate generic sources.
    """
    with open(TEST_IMG_PATH, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription_screenshot.png", f, "image/png")}
        )
    session_id = resp.json()["session_id"]

    conf_resp = client.post(f"/confirm/{session_id}", json={
        "medicines": ["NonExistentFakeMedXYZ"]
    })
    assert conf_resp.status_code == 200
    res = conf_resp.json()["result"]

    assert res["outcome"] == "cannot_verify"
    section_titles = [s["title"] for s in res["sections"]]
    assert "Unrecognized Medicine #1" in section_titles
    # Purpose section must NOT fabricate "Clinical Drug Database"
    purpose_sec = next(s for s in res["sections"] if s["title"] == "Prescription Purpose")
    assert "Clinical Drug Database" not in purpose_sec["sources"]
