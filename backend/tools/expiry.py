"""expiry.py - Expiry date parsing and verification tool. Owner: Member A."""
import re
from datetime import datetime
from typing import Dict, Any, Optional

MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
    "january": 1, "february": 2, "march": 3, "april": 4, "june": 6,
    "july": 7, "august": 8, "september": 9, "october": 10, "november": 11, "december": 12
}

def parse_expiry_date(text: str) -> Optional[datetime]:
    """
    Attempts to parse expiry date from raw text strings like:
    '05/2023', 'EXP: 11/24', 'Exp Date: Dec 2022', '2023-08', '04/26'
    """
    if not text:
        return None
    
    clean = text.lower().strip()
    
    # Pattern 1: Month Name Year e.g. "Dec 2023" or "Nov 25"
    m_name = re.search(r'(?:exp(?:\.|\s*date)?:?\s*)?([a-z]{3,9})[\s\/\-\.]+(\d{2,4})', clean)
    if m_name:
        month_str, year_str = m_name.groups()
        if month_str in MONTH_MAP:
            m = MONTH_MAP[month_str]
            y = int(year_str)
            if y < 100:
                y += 2000
            # Expire at the end of the month
            return datetime(y, m, 28)

    # Pattern 2: MM/YYYY or MM/YY e.g. "05/2024", "11/25", "03-2023"
    m_num = re.search(r'(?:exp(?:\.|\s*date)?:?\s*)?(\d{1,2})[\/\-\.](\d{2,4})', clean)
    if m_num:
        m_str, y_str = m_num.groups()
        m = int(m_str)
        y = int(y_str)
        if 1 <= m <= 12:
            if y < 100:
                y += 2000
            return datetime(y, m, 28)

    # Pattern 3: YYYY/MM or YYYY-MM
    m_ym = re.search(r'(\d{4})[\/\-](\d{1,2})', clean)
    if m_ym:
        y_str, m_str = m_ym.groups()
        y = int(y_str)
        m = int(m_str)
        if 1 <= m <= 12:
            return datetime(y, m, 28)

    return None

def check_expiry(raw_text_or_date: Optional[str]) -> Dict[str, Any]:
    """
    Checks if medicine is expired based on text or string date.
    Returns: {
        "found": bool,
        "raw": str,
        "parsed": str,
        "is_expired": bool,
        "warning": Optional[str]
    }
    """
    if not raw_text_or_date:
        return {
            "found": False,
            "raw": "",
            "parsed": None,
            "is_expired": False,
            "warning": None
        }

    parsed = parse_expiry_date(raw_text_or_date)
    now = datetime.now()
    
    if parsed:
        is_expired = parsed < now
        parsed_str = parsed.strftime("%b %Y")
        warning = f"This medicine expired in {parsed_str}. Do not consume expired medication." if is_expired else None
        return {
            "found": True,
            "raw": str(raw_text_or_date),
            "parsed": parsed_str,
            "is_expired": is_expired,
            "warning": warning
        }

    return {
        "found": False,
        "raw": str(raw_text_or_date),
        "parsed": None,
        "is_expired": False,
        "warning": None
    }
