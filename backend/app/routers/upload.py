"""
BITEL - Upload Router
Manejo de subida de archivos con validación de seguridad mejorada
🔒 Rate limiting: 10 uploads por minuto
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil
import uuid
from datetime import datetime
import os
import re
import logging
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user_required, get_current_admin_user
from app.rate_limit import limiter, RATE_LIMITS
from sqlalchemy.ext.asyncio import AsyncSession

import magic
from PIL import Image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_MIME_TYPES = {
    ".jpg": ["image/jpeg", "image/jpg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".gif": ["image/gif"],
    ".webp": ["image/webp"],
    ".pdf": ["application/pdf"],
}

MAGIC_SIGNATURES = {
    b'\xff\xd8\xff': '.jpg',
    b'\x89PNG\r\n\x1a\n': '.png',
    b'GIF87a': '.gif',
    b'GIF89a': '.gif',
    b'RIFF': '.webp',
    b'%PDF': '.pdf',
}


def verify_magic_bytes(content: bytes, expected_extension: str) -> bool:
    for signature, ext in MAGIC_SIGNATURES.items():
        if content.startswith(signature) and ext == expected_extension:
            return True
    if expected_extension == '.webp' and content.startswith(b'RIFF'):
        if b'WEBP' in content[:12]:
            return True
    return False


def validate_image_integrity(file_path: Path) -> bool:
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception:
        return False


def normalize_filename(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    name = name.lower()
    ext = ext.lower()
    accents_map = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
        'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u',
        'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
        'ñ': 'n', 'ç': 'c'
    }
    for accented, plain in accents_map.items():
        name = name.replace(accented, plain)
    name = re.sub(r'[^\w\-]', '-', name)
    name = re.sub(r'-+', '-', name)
    name = name.strip('-')
    if not name:
        name = 'file'
    return f"{name}{ext}"


def generate_unique_filename(original_filename: str, category: str) -> str:
    normalized = normalize_filename(original_filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"{category}_{timestamp}_{unique_id}_{normalized}"


@router.post("/{category}")
@limiter.limit("10/minute")
async def upload_file(
    request: Request,
    category: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    valid_categories = ["products", "services", "companies", "users", "countries", "receipts"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Categoría inválida. Usar: {', '.join(valid_categories)}"
        )

    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        logger.warning(f"Extensión no permitida: {file_ext} por usuario {current_user.user_id}")
        raise HTTPException(
            status_code=400,
            detail=f"Extensión no permitida. Usar: {', '.join(allowed_extensions)}"
        )

    category_dir = UPLOAD_DIR / category
    category_dir.mkdir(exist_ok=True)

    file_path = None
    try:
        content = await file.read(MAX_FILE_SIZE + 1)
        file_size = len(content)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Archivo muy grande. Máximo {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        if not verify_magic_bytes(content[:1024], file_ext):
            logger.error(f"Magic bytes inválidos: {file.filename} por usuario {current_user.user_id}")
            raise HTTPException(
                status_code=400,
                detail="El contenido del archivo no coincide con su extensión"
            )

        temp_path = None
        if file_ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
            temp_path = category_dir / f"temp_{uuid.uuid4().hex}{file_ext}"
            with temp_path.open("wb") as buffer:
                buffer.write(content)
            
            if not validate_image_integrity(temp_path):
                logger.error(f"Imagen corrupta: {file.filename} por usuario {current_user.user_id}")
                if temp_path and temp_path.exists():
                    temp_path.unlink()
                raise HTTPException(
                    status_code=400,
                    detail="El archivo no es una imagen válida o está corrupto"
                )
            
            if temp_path and temp_path.exists():
                temp_path.unlink()

        unique_filename = generate_unique_filename(file.filename, category)
        file_path = category_dir / unique_filename

        with file_path.open("wb") as buffer:
            buffer.write(content)

        file_url = f"/uploads/{category}/{unique_filename}"
        
        logger.info(f"Archivo subido: {file_url} por usuario {current_user.user_id}")

        return {
            "success": True,
            "url": file_url,
            "filename": unique_filename,
            "original_filename": file.filename,
            "category": category,
            "size": file_size
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al subir archivo: {str(e)}", exc_info=True)
        if file_path and file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Error al subir archivo: {str(e)}"
        )


@router.delete("/{category}/{filename}")
async def delete_file(
    category: str,
    filename: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    if ".." in filename or "/" in filename or "\\" in filename:
        logger.warning(f"Intento de path traversal: {filename} por usuario {current_user.user_id}")
        raise HTTPException(
            status_code=400,
            detail="Nombre de archivo inválido"
        )

    valid_categories = ["products", "services", "companies", "users", "countries", "receipts"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Categoría inválida. Usar: {', '.join(valid_categories)}"
        )

    try:
        file_path = UPLOAD_DIR / category / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Archivo no encontrado"
            )

        file_path.unlink()
        logger.info(f"Archivo eliminado: {filename} por usuario {current_user.user_id}")

        return {
            "success": True,
            "message": "Archivo eliminado correctamente",
            "filename": filename
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al eliminar archivo: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar archivo: {str(e)}"
        )
