# feature_services/resume/download_service.py

from weasyprint import HTML, default_url_fetcher
import tempfile
from typing import Optional
import logging

logging.getLogger('fontTools').setLevel(logging.WARNING)
logging.getLogger('weasyprint').setLevel(logging.WARNING)

def _safe_url_fetcher(url: str, *args, **kwargs):
    """Only allow inline data: URLs. User HTML could otherwise read local files
    (file://) or make the server call internal addresses (SSRF)."""
    if url.startswith("data:"):
        return default_url_fetcher(url, *args, **kwargs)
    raise ValueError(f"Blocked resource URL in resume HTML: {url[:80]}")

def generate_pdf_from_html(html_content: str) -> Optional[bytes]:
    """
    Converts HTML content to PDF bytes.
    Returns None if an error occurs.
    """
    try:
        pdf_bytes = HTML(string=html_content, url_fetcher=_safe_url_fetcher).write_pdf()
        return pdf_bytes
    except Exception as e:
        logging.error(f"PDF generation error: {e}")
        return None

def save_pdf_to_tempfile(pdf_bytes: bytes, filename: str = "resume.pdf") -> str:
    """
    Saves PDF bytes to a temporary file and returns the file path.
    """
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        tmp.write(pdf_bytes)
        return tmp.name
