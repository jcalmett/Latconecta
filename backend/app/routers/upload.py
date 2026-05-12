"""
LATCONECTA - Upload Router
Manejo de subida de archivos con validación de seguridad mejorada

MEJORAS DE SEGURIDAD (Mayo 2026):
- Agregada autenticación requerida (solo usuarios autenticados pueden subir/eliminar)
- Validación de magic bytes (verifica que el contenido coincida con la extensión)
- Validación de integridad de imágenes (PIL)
- Protección contra path traversal
- Logging de intentos sospechosos
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil
import uuid
from datetime import datetime
import os
import re
import logging
from typing import Optional

# Importar dependencias de autenticación
from app.database import get_db
from app.models.user import User
from app.dependencies import get_current_user_required, get_current_admin_user
from sqlalchemy.ext.asyncio import AsyncSession

# Para validación de magic bytes e imágenes
import magic
from PIL import Image

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/upload", tags=["upload"])

# Directorio base para uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Tamaño máximo de archivo (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024

# Extensiones permitidas y sus magic bytes esperados
ALLOWED_MIME_TYPES = {
    ".jpg": ["image/jpeg", "image/jpg"],
    ".jpeg": ["image/jpeg"],
    ".png": ["image/png"],
    ".gif": ["image/gif"],
    ".webp": ["image/webp"],
    ".pdf": ["application/pdf"],
}

# Firmas de magic bytes para verificación rápida
MAGIC_SIGNATURES = {
    b'\xff\xd8\xff': '.jpg',      # JPEG
    b'\x89PNG\r\n\x1a\n': '.png',  # PNG
    b'GIF87a': '.gif',              # GIF87a
    b'GIF89a': '.gif',              # GIF89a
    b'RIFF': '.webp',               # WEBP (verificación adicional necesaria)
    b'%PDF': '.pdf',                # PDF
}


def verify_magic_bytes(content: bytes, expected_extension: str) -> bool:
    """
    Verifica que los magic bytes del contenido coincidan con la extensión esperada.
    
    Args:
        content: Primeros 1024 bytes del archivo
        expected_extension: Extensión esperada (ej: '.jpg')
    
    Returns:
        True si los magic bytes son válidos, False en caso contrario
    """
    for signature, ext in MAGIC_SIGNATURES.items():
        if content.startswith(signature) and ext == expected_extension:
            return True
    
    # Caso especial para WEBP (necesita verificación adicional después de RIFF)
    if expected_extension == '.webp' and content.startswith(b'RIFF'):
        if b'WEBP' in content[:12]:
            return True
    
    return False


def validate_image_integrity(file_path: Path) -> bool:
    """
    Valida que un archivo de imagen sea legítimo usando PIL.
    
    Args:
        file_path: Ruta del archivo a validar
    
    Returns:
        True si la imagen es válida, False en caso contrario
    """
    try:
        with Image.open(file_path) as img:
            img.verify()  # Verifica que sea una imagen válida
        return True
    except Exception:
        return False


def normalize_filename(filename: str) -> str:
    """
    Normaliza nombre de archivo para compatibilidad Linux/Windows

    Cambios aplicados:
    - Convierte a lowercase
    - Remueve acentos
    - Reemplaza espacios con guiones
    - Remueve caracteres especiales
    - Limpia múltiples guiones consecutivos
    """
    # Separar nombre y extensión
    name, ext = os.path.splitext(filename)

    # Convertir a lowercase
    name = name.lower()
    ext = ext.lower()

    # Mapeo manual de caracteres con acentos
    accents_map = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'à': 'a', 'è': 'e', 'ì': 'i', 'ò': 'o', 'ù': 'u',
        'ä': 'a', 'ë': 'e', 'ï': 'i', 'ö': 'o', 'ü': 'u',
        'â': 'a', 'ê': 'e', 'î': 'i', 'ô': 'o', 'û': 'u',
        'ñ': 'n', 'ç': 'c'
    }

    # Reemplazar acentos
    for accented, plain in accents_map.items():
        name = name.replace(accented, plain)

    # Reemplazar espacios y caracteres especiales con guiones
    name = re.sub(r'[^\w\-]', '-', name)

    # Reemplazar múltiples guiones consecutivos con uno solo
    name = re.sub(r'-+', '-', name)

    # Remover guiones al inicio y fin
    name = name.strip('-')

    # Si el nombre quedó vacío, usar un placeholder
    if not name:
        name = 'file'

    return f"{name}{ext}"


def generate_unique_filename(original_filename: str, category: str) -> str:
    """
    Genera nombre de archivo único normalizado

    Formato: {category}_{timestamp}_{unique_id}_{filename_normalizado}
    """
    normalized = normalize_filename(original_filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    return f"{category}_{timestamp}_{unique_id}_{normalized}"


@router.post("/{category}")
async def upload_file(
    category: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_required)  # ✅ Requiere autenticación
):
    """
    Sube un archivo a la categoría especificada

    **Requiere autenticación:** Cualquier usuario autenticado puede subir archivos
    """
    valid_categories = ["products", "services", "companies", "users", "countries", "receipts"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Categoría inválida. Usar: {', '.join(valid_categories)}"
        )

    # ✅ Verificar extensión
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        logger.warning(f"Extensión no permitida: {file_ext} por usuario {current_user.user_id}")
        raise HTTPException(
            status_code=400,
            detail=f"Extensión no permitida. Usar: {', '.join(allowed_extensions)}"
        )

    # Crear directorio de categoría si no existe
    category_dir = UPLOAD_DIR / category
    category_dir.mkdir(exist_ok=True)

    file_path = None
    try:
        # ✅ Leer y validar tamaño
        content = await file.read(MAX_FILE_SIZE + 1)
        file_size = len(content)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Archivo muy grande. Máximo {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # ✅ Verificar magic bytes
        if not verify_magic_bytes(content[:1024], file_ext):
            logger.error(f"Magic bytes inválidos: {file.filename} por usuario {current_user.user_id}")
            raise HTTPException(
                status_code=400,
                detail="El contenido del archivo no coincide con su extensión"
            )

        # ✅ Validar integridad de imágenes (si es imagen, no PDF)
        temp_path = None
        if file_ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
            # Guardar temporalmente para validar con PIL
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
            
            # Eliminar temporal
            if temp_path and temp_path.exists():
                temp_path.unlink()

        # ✅ Generar nombre único y guardar
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
        # Limpiar archivo si existe
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
    current_user: User = Depends(get_current_admin_user)  # ✅ Requiere admin/superadmin
):
    """
    Elimina un archivo

    **Requiere autenticación:** Admin o Superadmin
    """
    # ✅ Protección contra path traversal
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
