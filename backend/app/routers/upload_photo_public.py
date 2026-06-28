"""
Upload Router — Foto de Perfil en Registro (público, sin autenticación)
Permite subir la foto de perfil durante el registro, antes de tener token.
Máximo 5MB. Formatos: jpg, jpeg, png, gif, webp.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pathlib import Path
import uuid, logging
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR  = Path("uploads")
MAX_SIZE    = 5 * 1024 * 1024   # 5MB
ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
IMAGE_MAGIC = {
    b'\xff\xd8\xff': '.jpg',
    b'\x89PNG':      '.png',
    b'GIF8':         '.gif',
    b'RIFF':         '.webp',
}

def _valid_magic(content: bytes, ext: str) -> bool:
    for sig, sig_ext in IMAGE_MAGIC.items():
        if content.startswith(sig):
            return sig_ext in (ext, '.jpg' if ext == '.jpeg' else ext)
    return False


@router.post("/users-public")
async def upload_user_photo_public(
    request: Request,
    file: UploadFile = File(...),
):
    """
    Upload público de foto de perfil — para uso durante el registro.
    Sin autenticación — el usuario aún no tiene token en ese momento.
    Solo imágenes. Máximo 5MB.
    """
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(400, f"Formato no permitido. Usa: {', '.join(ALLOWED_EXT)}")

    content = await file.read(MAX_SIZE + 1)
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "El archivo supera el límite de 5MB.")

    if not _valid_magic(content, ext):
        raise HTTPException(400, "El archivo no es una imagen válida.")

    category_dir = UPLOAD_DIR / "users"
    category_dir.mkdir(parents=True, exist_ok=True)

    timestamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id   = str(uuid.uuid4())[:8]
    filename    = f"users_{timestamp}_{unique_id}{ext}"
    file_path   = category_dir / filename

    with file_path.open("wb") as f:
        f.write(content)

    logger.info(f"Foto de perfil subida (registro público): {filename}")

    return {
        "success":  True,
        "url":      f"/uploads/users/{filename}",
        "filename": filename,
        "size":     len(content),
    }
