"""
Upload Router — Recibos de Compra (público, sin autenticación)
Permite guardar el PDF del recibo generado por el frontend.
Máximo 10MB. Solo formato PDF.
Accesible sin autenticación — las compras pueden realizarse como guest.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pathlib import Path
import uuid, os, logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads")
MAX_SIZE   = 10 * 1024 * 1024  # 10MB
PDF_MAGIC  = b'%PDF'


@router.post("/receipts-public")
async def upload_receipt_pdf(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Upload público del recibo PDF de compra.
    Sin autenticación — las compras pueden realizarse como guest.
    Solo PDF. Máximo 10MB.
    """
    ext = Path(file.filename).suffix.lower()
    if ext != ".pdf":
        raise HTTPException(400, "Solo se aceptan archivos PDF.")

    content = await file.read(MAX_SIZE + 1)
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "El archivo supera el límite de 10MB.")

    if not content.startswith(PDF_MAGIC):
        raise HTTPException(400, "El archivo no es un PDF válido.")

    category_dir = UPLOAD_DIR / "receipts"
    category_dir.mkdir(parents=True, exist_ok=True)

    timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id   = str(uuid.uuid4())[:8]
    unique_name = f"recibo_{timestamp}_{unique_id}.pdf"
    file_path   = category_dir / unique_name

    with file_path.open("wb") as f:
        f.write(content)

    logger.info(f"Recibo PDF subido: {unique_name}")

    return {
        "success":  True,
        "url":      f"/uploads/receipts/{unique_name}",
        "filename": unique_name,
        "size":     len(content),
    }
