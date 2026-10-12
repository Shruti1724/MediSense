"""fake_tools.py - fake versions of Member B's 6 functions. Owner: Member B.
They return hardcoded data in the exact contract shape, so Member A can build the
whole agent flow before the real data exists. Run `python fake_tools.py` to self-test.
Real versions go in backend/tools/knowledge.py with the SAME names and shapes."""
import os
from difflib import SequenceMatcher
from itertools import combinations
from typing import List
from schemas import MedicineMatch, DrugInfo, Clash, ConditionInfo, Lifestyle

FAKE_SOURCE = "FAKE DATA (replace with real source)"

# brand: (brand, generic, type, drug_class, common_use)
_DB = {
    "dolo 650": ("Dolo 650", "paracetamol", "OTC", "analgesic/antipyretic", "fever and mild pain"),
    "augmentin 625": ("Augmentin 625", "amoxicillin+clavulanate", "prescription-only",
                      "antibiotic", "bacterial infections"),
    "brufen 400": ("Brufen 400", "ibuprofen", "OTC", "nsaid", "pain and inflammation"),
    "warf 5": ("Warf 5", "warfarin", "prescription-only", "anticoagulant", "preventing blood clots"),
    "cetzine": ("Cetzine", "cetirizine", "OTC", "antihistamine", "allergy symptoms"),
    "pan 40": ("Pan 40", "pantoprazole", "prescription-only", "ppi", "acidity and reflux"),
}

_INFO = {
    "paracetamol": {
        "uses": "Commonly used for fever and mild to moderate pain.",
        "warnings": "Too much can harm the liver. Check other medicines for paracetamol.",
        "who_should_avoid": "People with serious liver disease should ask a doctor first.",
        "pregnancy": "Ask a doctor or pharmacist before use.",
        "side_effects": "Rare at normal use. Allergic reactions are possible.",
        "interactions": "Alcohol and some anticoagulants can interact.",
    },
    "ibuprofen": {
        "uses": "Commonly used for pain and inflammation.",
        "warnings": "Can irritate the stomach and affect kidneys.",
        "who_should_avoid": "People with ulcers, kidney disease, or on blood thinners.",
        "pregnancy": "Not advised without a doctor's guidance.",
        "side_effects": "Stomach upset, heartburn.",
        "interactions": "Interacts with warfarin and other blood thinners.",
    },
    "amoxicillin+clavulanate": {
        "uses": "Commonly used for bacterial infections. Prescription-only.",
        "warnings": "Tell your doctor about any penicillin allergy.",
        "who_should_avoid": "People allergic to penicillin.",
        "pregnancy": "Ask a doctor before use.",
        "side_effects": "Diarrhoea, nausea, rash.",
        "interactions": "Can affect warfarin. Ask a pharmacist.",
    },
    "warfarin": {
        "uses": "Commonly used to prevent blood clots. Prescription-only.",
        "warnings": "Many medicines and foods change its effect.",
        "who_should_avoid": "Anyone who has not been prescribed it.",
        "pregnancy": "Needs specialist advice.",
        "side_effects": "Bleeding, bruising.",
        "interactions": "Interacts with painkillers like ibuprofen.",
    },
}

_CLASHES = {
    frozenset({"warfarin", "ibuprofen"}): (
        "major", "Together they can raise the risk of serious bleeding. "
                 "Contact your doctor or pharmacist before the next dose."),
}

def match_medicine(name: str) -> dict:
    key = (name or "").strip().lower()
    if not key:
        return MedicineMatch(matched=False, score=0.0, candidates=[]).model_dump()
    scored = sorted(((SequenceMatcher(None, key, k).ratio(), k) for k in _DB), reverse=True)
    best_score, best_key = scored[0]
    candidates = [_DB[k][0] for _, k in scored[:3]]
    if best_score >= 0.80:
        b = _DB[best_key]
        return MedicineMatch(matched=True, brand=b[0], generic=b[1], type=b[2], drug_class=b[3],
                             common_use=b[4], score=round(best_score, 2),
                             candidates=candidates).model_dump()
    return MedicineMatch(matched=False, score=round(best_score, 2), candidates=candidates).model_dump()

def get_drug_info(generic: str) -> dict:
    sections = _INFO.get((generic or "").strip().lower())
    if not sections:
        return DrugInfo(found=False).model_dump()
    return DrugInfo(found=True, sections=sections, sources=[FAKE_SOURCE]).model_dump()

def check_clashes(generics: List[str]) -> list:
    out = []
    for a, b in combinations([g.lower() for g in generics], 2):
        hit = _CLASHES.get(frozenset({a, b}))
        if hit:
            out.append(Clash(drug_a=a, drug_b=b, severity=hit[0], note=hit[1],
                             source=FAKE_SOURCE).model_dump())
    return out

def get_condition_info(drug_classes: List[str]) -> dict:
    classes = set(drug_classes)
    if "antibiotic" in classes and "analgesic/antipyretic" in classes:
        return ConditionInfo(
            found=True,
            commonly_used_for="This combination is commonly used for infections with fever.",
            symptoms=["fever", "cough", "sore throat"],
            red_flags=["trouble breathing", "chest pain", "fever lasting more than 3 days"],
            sources=[FAKE_SOURCE]).model_dump()
    return ConditionInfo(found=False).model_dump()

def get_lifestyle(condition: str, generics: List[str]) -> dict:
    if not condition:
        return Lifestyle(found=False).model_dump()
    return Lifestyle(found=True,
                     eat=["light home-cooked food", "plenty of water"],
                     avoid=["alcohol while on these medicines"],
                     rest=["extra sleep and rest"],
                     sources=[FAKE_SOURCE]).model_dump()

def make_pdf(result: dict, path: str = "report.pdf") -> str:
    """Fake PDF: one page with the section titles. Real version is nicer."""
    try:
        from reportlab.pdfgen import canvas
        c = canvas.Canvas(path)
        y = 800
        c.drawString(60, y, "MediSense Report")
        for s in result.get("sections", []):
            y -= 24
            c.drawString(60, y, str(s.get("title", ""))[:90])
        c.save()
        return os.path.abspath(path)
    except ImportError:
        txt = os.path.splitext(path)[0] + ".txt"
        with open(txt, "w") as f:
            f.write(str(result))
        return os.path.abspath(txt)

if __name__ == "__main__":
    m = match_medicine("Augmantin 625")
    assert m["matched"] and m["generic"] == "amoxicillin+clavulanate", m
    assert not match_medicine("zzzzqq")["matched"]
    assert get_drug_info("paracetamol")["found"]
    assert not get_drug_info("notadrug")["found"]
    assert check_clashes(["warfarin", "ibuprofen"])[0]["severity"] == "major"
    assert check_clashes(["paracetamol", "cetirizine"]) == []
    assert get_condition_info(["antibiotic", "analgesic/antipyretic"])["found"]
    assert get_lifestyle("fever", ["paracetamol"])["found"]
    print("fake_tools self-test passed")
