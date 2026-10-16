"""test_prescription_pipeline.py - Comprehensive regression tests for MediSense prescription extraction pipeline.
Covers:
1. Uploading the five-medicine prescription image.
2. Verifying all five expected names are extracted with timing and dosages.
3. Ensuring Augmentin 625 is NOT inserted.
4. Ensuring response schema maps accurately for frontend rendering.
5. Ensuring confirmation preserves all five medicines without loss or overwrite.
6. Ensuring the final report preserves confirmed medicines and contains NO placeholder 'FAKE DATA' sources.
7. Handling unreadable images and genuinely unknown medicines safely.
"""
import os
import sys
import numpy as np
import cv2
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import config
from main import app
from tools.fuzzy import match_medicine
from agents.extraction import extract_prescription_data

client = TestClient(app)

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "assets")
FIVE_MED_IMAGE = os.path.join(ASSETS_DIR, "five_medicine_prescription.png")


def test_01_upload_five_medicine_prescription_extracts_all_five():
    """
    Test 1 & 2: Upload the supplied five-medicine prescription image.
    Verifies that all 5 medicines are extracted dynamically from the image:
    1. Azithral 500
    2. Dolo 650
    3. Montair LC
    4. Pan 40
    5. Becosules
    """
    assert os.path.exists(FIVE_MED_IMAGE), f"Fixture image not found at {FIVE_MED_IMAGE}"

    with open(FIVE_MED_IMAGE, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription.png", f, "image/png")}
        )

    assert resp.status_code == 200
    data = resp.json()
    assert "session_id" in data
    assert data["status"] == "waiting_confirmation"
    assert data["requires_confirmation"] is True

    extracted = data["extracted_medicines"]
    assert len(extracted) == 5, f"Expected 5 extracted medicines, got {len(extracted)}: {extracted}"

    extracted_brands = [m.get("brand") for m in extracted]
    assert "Azithral 500" in extracted_brands
    assert "Dolo 650" in extracted_brands
    assert "Montair LC" in extracted_brands
    assert "Pan 40" in extracted_brands
    assert "Becosules" in extracted_brands

    # Verify dosages and timing were captured
    azithral = next(m for m in extracted if m.get("brand") == "Azithral 500")
    assert "500" in (azithral.get("strength") or "")
    assert "1-0-0" in (azithral.get("frequency") or "")

    dolo = next(m for m in extracted if m.get("brand") == "Dolo 650")
    assert "650" in (dolo.get("strength") or "")
    assert "1-1-1" in (dolo.get("frequency") or "")

    montair = next(m for m in extracted if m.get("brand") == "Montair LC")
    assert "0-0-1" in (montair.get("frequency") or "")

    pan = next(m for m in extracted if m.get("brand") == "Pan 40")
    assert "40" in (pan.get("strength") or "")
    assert "1-0-0" in (pan.get("frequency") or "")

    becosules = next(m for m in extracted if m.get("brand") == "Becosules")
    assert "0-1-0" in (becosules.get("frequency") or "")


def test_02_augmentin_not_inserted_in_five_medicine_prescription():
    """
    Test 3: Ensure Augmentin 625 is NEVER inserted into a prescription
    where it does not exist.
    """
    with open(FIVE_MED_IMAGE, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("my_prescription.png", f, "image/png")}
        )

    data = resp.json()
    extracted_brands = [m.get("brand", "").lower() for m in data["extracted_medicines"]]
    raw_texts = [m.get("raw", "").lower() for m in data["extracted_medicines"]]
    matched_brands = [m.get("brand", "").lower() for m in data.get("matches", []) if m]

    assert not any("augmentin" in b for b in extracted_brands), "Augmentin must not be in extracted medicines"
    assert not any("augmentin" in r for r in raw_texts), "Augmentin must not be in raw texts"
    assert not any("augmentin" in mb for mb in matched_brands), "Augmentin must not be in database matches"


def test_03_frontend_response_schema_mapping():
    """
    Test 4: Verify the API response matches what frontend UploadVerifyScreen.jsx expects:
    - extracted_medicines: list of {raw, brand, strength, frequency, confidence}
    - matches: list of {matched, brand, generic, candidates, score}
    - requires_confirmation: bool
    - session_id: str
    """
    with open(FIVE_MED_IMAGE, "rb") as f:
        resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription.png", f, "image/png")}
        )

    data = resp.json()
    extracted = data["extracted_medicines"]
    matches = data["matches"]
    assert len(extracted) == len(matches) == 5

    # Simulate the exact frontend transformation in UploadVerifyScreen.jsx:
    frontend_rows = []
    for index, medicine in enumerate(extracted):
        match = matches[index]
        frontend_rows.append({
            "id": f"rx-test-{index}",
            "name": match["brand"] if match.get("matched") else (medicine.get("brand") or medicine.get("raw") or ""),
            "strength": medicine.get("strength") or "",
            "timing": medicine.get("frequency") or "",
            "confidence": "High" if medicine.get("confidence", 0) >= 0.8 else "Check this",
        })

    assert len(frontend_rows) == 5
    names = [r["name"] for r in frontend_rows]
    assert names == ["Azithral 500", "Dolo 650", "Montair LC", "Pan 40", "Becosules"]
    assert all(r["confidence"] == "High" for r in frontend_rows)


def test_04_confirmation_preserves_all_five_medicines():
    """
    Test 5: Ensuring confirmation preserves the original extracted medicines
    and passes them to knowledge retrieval and composer.
    """
    with open(FIVE_MED_IMAGE, "rb") as f:
        start_resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription.png", f, "image/png")}
        )

    session_id = start_resp.json()["session_id"]
    extracted = start_resp.json()["extracted_medicines"]

    # User confirms the extracted medicines list
    conf_payload = [
        {"raw": m["raw"], "brand": m["brand"], "strength": m.get("strength"), "frequency": m.get("frequency")}
        for m in extracted
    ]
    conf_resp = client.post(f"/confirm/{session_id}", json={"medicines": conf_payload})
    assert conf_resp.status_code == 200

    result = conf_resp.json()["result"]
    assert result["type"] == "prescription_report"
    assert result["outcome"] == "ok"

    # Verify that each confirmed medicine has a dedicated section
    section_titles = [s["title"] for s in result["sections"]]
    assert any("Azithral 500" in t for t in section_titles)
    assert any("Dolo 650" in t for t in section_titles)
    assert any("Montair LC" in t for t in section_titles)
    assert any("Pan 40" in t for t in section_titles)
    assert any("Becosules" in t for t in section_titles)
    assert not any("Unrecognized Medicine" in t for t in section_titles)
    assert not any("Augmentin" in t for t in section_titles)


def test_05_final_report_has_no_fake_source_placeholders():
    """
    Test 6: Ensuring the final report preserves confirmed medicines and
    does NOT contain placeholder 'FAKE DATA' sources.
    """
    with open(FIVE_MED_IMAGE, "rb") as f:
        start_resp = client.post(
            "/start",
            data={"mode": "prescription", "consent": "true"},
            files={"image": ("prescription.png", f, "image/png")}
        )

    session_id = start_resp.json()["session_id"]
    client.post(f"/confirm/{session_id}", json={
        "medicines": [
            {"brand": "Azithral 500"},
            {"brand": "Dolo 650"},
            {"brand": "Montair LC"},
            {"brand": "Pan 40"},
            {"brand": "Becosules"},
        ]
    })

    result_resp = client.get(f"/result/{session_id}")
    assert result_resp.status_code == 200
    report = result_resp.json()

    # Verify all sections and sources
    for sec in report["sections"]:
        for src in sec.get("sources", []):
            assert "fake data" not in src.lower(), f"Placeholder source detected in section {sec['title']}: {src}"
            assert "replace with real source" not in src.lower(), f"Placeholder found: {src}"
            assert "sample source" not in src.lower(), f"Sample source found: {src}"

    # Verify PDF generation also succeeds
    pdf_resp = client.get(f"/result/{session_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000


def test_06_unreadable_image_handled_safely_without_augmentin():
    """
    Test 7a: Handling an unreadable image safely.
    When a non-blurry image with no readable text is uploaded, it must NOT
    invent Augmentin 625 or any other medicine. It should return empty medicines list.
    """
    # Create a solid gray image (not blurry, but no text)
    unreadable_img = np.ones((400, 600, 3), dtype=np.uint8) * 200
    unreadable_path = os.path.join(ASSETS_DIR, "unreadable_blank.png")
    cv2.imwrite(unreadable_path, unreadable_img)

    try:
        with open(unreadable_path, "rb") as f:
            resp = client.post(
                "/start",
                data={"mode": "prescription", "consent": "true"},
                files={"image": ("unreadable.png", f, "image/png")}
            )

        assert resp.status_code == 200
        data = resp.json()
        assert len(data["extracted_medicines"]) == 0, f"Expected 0 medicines, got {data['extracted_medicines']}"
        assert not any("augmentin" in str(m).lower() for m in data["extracted_medicines"])
    finally:
        if os.path.exists(unreadable_path):
            os.remove(unreadable_path)


def test_07_genuinely_unknown_medicine_handled_safely():
    """
    Test 7b: Handling a genuinely unknown medicine safely.
    When an unknown medicine name is confirmed, it must be marked as Unrecognized,
    set outcome 'cannot_verify', and contain no invented facts or fake sources.
    """
    res = client.post("/start", data={"mode": "prescription", "consent": "true", "typed_name": "NonExistentDrug123X"})
    session_id = res.json()["session_id"]

    conf_resp = client.post(f"/confirm/{session_id}", json={
        "medicines": [{"brand": "NonExistentDrug123X"}]
    })
    result = conf_resp.json()["result"]

    assert result["outcome"] == "cannot_verify"
    section_titles = [s["title"] for s in result["sections"]]
    assert any("Unrecognized Medicine" in t for t in section_titles)

    unrecognized_sec = next(s for s in result["sections"] if "Unrecognized Medicine" in s["title"])
    assert "could not verify" in unrecognized_sec["body"].lower()
    assert len(unrecognized_sec["sources"]) == 0
