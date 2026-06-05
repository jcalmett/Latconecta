"""
Upload Router — Reclamaciones (público, sin autenticación)
Permite adjuntar hasta 2 documentos por reclamación.
Máximo 5MB por archivo. Formatos: jpg, jpeg, png, pdf.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pathlib import Path
import uuid, os, re, logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR   = Path("uploads")
MAX_SIZE     = 5 * 1024 * 1024  # 5MB
ALLOWED_EXT  = {".jpg", ".jpeg", ".png", ".pdf"}
MAGIC_BYTES  = {
    b'\xff\xd8\xff': ".jpg",
    b'\x89PNG\r\n\x1a\n': ".png",
    b'%PDF': ".pdf",
}

def verify_magic(content: bytes, ext: str) -> bool:
    for sig, e in MAGIC_BYTES.items():
        if content.startswith(sig):
            return e == ext or (ext == ".jpeg" and e == ".jpg")
    return False

def normalize_filename(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    name = name.lower()
    for a, b in {"á":"a","é":"e","í":"i","ó":"o","ú":"u","ñ":"n","ç":"c"}.items():
        name = name.replace(a, b)
    name = re.sub(r'[^\w\-]', '-', name)
    name = re.sub(r'-+', '-', name).strip('-') or 'file'
    return f"{name}{ext.lower()}"

@router.post("/reclamaciones-public")
async def upload_reclamacion_doc(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Upload público para documentos del Libro de Reclamaciones.
    Sin autenticación requerida — Art. 4-B DS 006-2014.
    Máximo 5MB. Formatos: jpg, jpeg, png, pdf.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Formato no permitido. Use: jpg, jpeg, png o pdf.")

    content = await file.read(MAX_SIZE + 1)
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "El archivo supera el límite de 5MB.")

    if not verify_magic(content[:16], ext if ext != ".jpeg" else ".jpg"):
        raise HTTPException(400, "El contenido del archivo no coincide con su extensión.")

    category_dir = UPLOAD_DIR / "reclamaciones"
    category_dir.mkdir(parents=True, exist_ok=True)

    timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id   = str(uuid.uuid4())[:8]
    normalized  = normalize_filename(file.filename)
    unique_name = f"reclamo_{timestamp}_{unique_id}_{normalized}"
    file_path   = category_dir / unique_name

    with file_path.open("wb") as f:
        f.write(content)

    logger.info(f"Documento reclamación subido: {unique_name}")
    return {
        "success":           True,
        "url":               f"/uploads/reclamaciones/{unique_name}",
        "filename":          unique_name,
        "original_filename": file.filename,
        "size":              len(content),
    }
