"""ReportLab PDF export for the contract Result shape."""
import os
import re
import tempfile
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

import config

_SEVERITY_ORDER = {"major": 0, "moderate": 1, "minor": 2}
_SEVERITY_COLORS = {"major": colors.HexColor("#ba1a1a"), "moderate": colors.HexColor("#b85c00"), "minor": colors.HexColor("#5a605c")}


def _as_dict(result):
    if hasattr(result, "model_dump"):
        return result.model_dump()
    return result if isinstance(result, dict) else {}


def _paragraph_text(value):
    text = escape(str(value or ""))
    return re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text).replace("\n", "<br/>")


def _styles():
    styles = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("MediSenseTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=18, leading=22, alignment=TA_LEFT, textColor=colors.HexColor("#191c1a"), spaceAfter=10),
        "heading": ParagraphStyle("MediSenseHeading", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=colors.HexColor("#191c1a"), spaceBefore=8, spaceAfter=5),
        "body": ParagraphStyle("MediSenseBody", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13, textColor=colors.HexColor("#191c1d"), spaceAfter=5),
        "small": ParagraphStyle("MediSenseSmall", parent=styles["BodyText"], fontName="Helvetica", fontSize=8, leading=10, textColor=colors.HexColor("#5a605c"), spaceAfter=4),
        "warning": ParagraphStyle("MediSenseWarning", parent=styles["BodyText"], fontName="Helvetica", fontSize=9, leading=12, textColor=colors.white),
    }


def make_pdf(result, path=None) -> str:
    data = _as_dict(result)
    if path is None:
        os.makedirs(config.UPLOADS_DIR, exist_ok=True)
        handle = tempfile.NamedTemporaryFile(prefix="medisense_", suffix=".pdf", dir=config.UPLOADS_DIR, delete=False)
        path = handle.name
        handle.close()
    output_path = str(Path(path).expanduser().resolve())
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    styles = _styles()

    story = [Paragraph("MediSense report", styles["title"])]
    story.append(Paragraph(f"Outcome: {escape(str(data.get('outcome', 'unknown')).replace('_', ' ').title())}", styles["heading"]))

    warnings = sorted(data.get("warnings") or [], key=lambda item: _SEVERITY_ORDER.get(item.get("level"), 3))
    for warning in warnings:
        level = str(warning.get("level", "warning")).lower()
        label = level.title() + " warning"
        table = Table([[Paragraph(f"<b>{escape(label)}</b><br/>{_paragraph_text(warning.get('text', ''))}", styles["warning"])]], colWidths=[170 * mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), _SEVERITY_COLORS.get(level, colors.HexColor("#5a605c"))),
            ("BOX", (0, 0), (-1, -1), 0.5, _SEVERITY_COLORS.get(level, colors.HexColor("#5a605c"))),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story.extend([table, Spacer(1, 5)])

    for section in data.get("sections") or []:
        story.append(Paragraph(_paragraph_text(section.get("title", "")), styles["heading"]))
        story.append(Paragraph(_paragraph_text(section.get("body", "")), styles["body"]))
        story.append(Paragraph("<b>Sources:</b>", styles["small"]))
        for source in section.get("sources") or []:
            story.append(Paragraph(f"- {_paragraph_text(source)}", styles["small"]))

    story.extend([Spacer(1, 8), Paragraph(_paragraph_text(data.get("disclaimer", config.DISCLAIMER)), styles["small"])])
    document = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm, topMargin=18 * mm, bottomMargin=18 * mm)
    document.build(story)
    return output_path
