"""Render a certificate of completion as a PDF (ReportLab + QR code)."""
from io import BytesIO

import qrcode
from django.conf import settings
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

NAVY = colors.HexColor("#0b1f4d")
ORANGE = colors.HexColor("#f97316")


def _verification_url(certificate) -> str:
    base = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
    return f"{base}/verify/{certificate.verification_code}"


def _qr_image(data: str) -> ImageReader:
    img = qrcode.make(data)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return ImageReader(buf)


def render_certificate_pdf(certificate) -> bytes:
    buf = BytesIO()
    width, height = landscape(A4)
    c = canvas.Canvas(buf, pagesize=landscape(A4))

    # Decorative border
    c.setStrokeColor(NAVY)
    c.setLineWidth(3)
    c.rect(15 * mm, 15 * mm, width - 30 * mm, height - 30 * mm)
    c.setStrokeColor(ORANGE)
    c.setLineWidth(1)
    c.rect(18 * mm, 18 * mm, width - 36 * mm, height - 36 * mm)

    cx = width / 2

    # Brand / logo placeholder (text wordmark)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 30)
    c.drawCentredString(cx, height - 48 * mm, "Digital Nalanda")
    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(cx, height - 56 * mm, "CERTIFICATE OF COMPLETION")

    c.setFillColor(NAVY)
    c.setFont("Helvetica", 12)
    c.drawCentredString(cx, height - 80 * mm, "This is to certify that")

    c.setFillColor(ORANGE)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(cx, height - 95 * mm, certificate.recipient_name)

    c.setFillColor(NAVY)
    c.setFont("Helvetica", 12)
    c.drawCentredString(cx, height - 110 * mm, "has successfully completed the course")
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(cx, height - 123 * mm, certificate.course.title)

    # QR code linking to the public verification page
    qr = _qr_image(_verification_url(certificate))
    c.drawImage(qr, width - 60 * mm, 28 * mm, 32 * mm, 32 * mm)
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.grey)
    c.drawCentredString(width - 44 * mm, 25 * mm, "Scan to verify")

    # Signature placeholder
    c.setStrokeColor(NAVY)
    c.setLineWidth(0.7)
    c.line(35 * mm, 42 * mm, 95 * mm, 42 * mm)
    c.setFillColor(NAVY)
    c.setFont("Helvetica", 10)
    c.drawString(35 * mm, 36 * mm, "Authorised Signature")
    c.drawString(35 * mm, 31 * mm, "Digital Nalanda")

    # Footer: number, code, dates
    issued = certificate.issue_date.strftime("%d %B %Y")
    c.setFont("Helvetica", 9)
    c.setFillColor(colors.grey)
    c.drawCentredString(cx, 24 * mm, f"Certificate No: {certificate.certificate_number}    |    Issued: {issued}")
    c.drawCentredString(cx, 19 * mm, f"Verification code: {certificate.verification_code}")

    c.showPage()
    c.save()
    return buf.getvalue()
