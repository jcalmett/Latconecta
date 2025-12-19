"""
BITEL - Upload Router
Manejo de subida de archivos con normalización de nombres para compatibilidad Linux
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid
from datetime import datetime
import os
import re

router = APIRouter(prefix="/upload", tags=["upload"])

# Directorio base para uploads
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Tamaño máximo de archivo (10MB)
MAX_FILE_SIZE = 10 * 1024 * 1024


def normalize_filename(filename: str) -> str:
    """
    Normaliza nombre de archivo para compatibilidad Linux/Windows

    Cambios aplicados:
    - Convierte a lowercase
    - Remueve acentos (á → a, é → e, etc.)
    - Reemplaza espacios con guiones
    - Remueve caracteres especiales
    - Limpia múltiples guiones consecutivos

    Args:
        filename: Nombre original del archivo

    Returns:
        Nombre normalizado del archivo

    Examples:
        >>> normalize_filename("Mi Foto de Perú.JPG")
        "mi-foto-de-peru.jpg"
        >>> normalize_filename("Producto N°1 (2024).png")
        "producto-n-1-2024.png"
    """
    # Separar nombre y extensión
    name, ext = os.path.splitext(filename)

    # Convertir a lowercase
    name = name.lower()
    ext = ext.lower()

    # Mapeo manual de caracteres con acentos (más robusto que unidecode)
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
    # Mantener solo letras, números y guiones
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
    Ejemplo: products_20251203_a1b2c3d4_mi-producto.jpg

    Args:
        original_filename: Nombre original del archivo
        category: Categoría (products, services, companies, etc.)

    Returns:
        Nombre único normalizado
    """
    # Normalizar nombre original
    normalized = normalize_filename(original_filename)

    # Timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # ID único corto (8 caracteres)
    unique_id = str(uuid.uuid4())[:8]

    # Combinar todo
    return f"{category}_{timestamp}_{unique_id}_{normalized}"


@router.post("/{category}")
async def upload_file(category: str, file: UploadFile = File(...)):
    """
    Sube un archivo a la categoría especificada

    Args:
        category: Categoría del archivo (products, services, companies, users, countries, receipts)
        file: Archivo a subir

    Returns:
        dict: URL del archivo subido

    Raises:
        HTTPException 400: Si la categoría es inválida o el archivo es muy grande
        HTTPException 500: Si hay error al guardar el archivo
    """
    # ✅ NUEVO: Agregar "receipts" a categorías válidas
    valid_categories = ["products", "services", "companies", "users", "countries", "receipts"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=400,
            detail=f"Categoría inválida. Usar: {', '.join(valid_categories)}"
        )

    # ✅ NUEVO: Agregar .pdf a extensiones permitidas
    allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"}
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Extensión no permitida. Usar: {', '.join(allowed_extensions)}"
        )

    # Crear directorio de categoría si no existe
    category_dir = UPLOAD_DIR / category
    category_dir.mkdir(exist_ok=True)

    try:
        # Generar nombre único normalizado
        unique_filename = generate_unique_filename(file.filename, category)
        file_path = category_dir / unique_filename

        # Guardar archivo
        with file_path.open("wb") as buffer:
            # Leer en chunks para archivos grandes
            file_size = 0
            while chunk := await file.read(8192):  # 8KB chunks
                file_size += len(chunk)

                # Verificar tamaño máximo
                if file_size > MAX_FILE_SIZE:
                    # Eliminar archivo parcial
                    if file_path.exists():
                        file_path.unlink()
                    raise HTTPException(
                        status_code=400,
                        detail=f"Archivo muy grande. Máximo {MAX_FILE_SIZE / 1024 / 1024}MB"
                    )

                buffer.write(chunk)

        # Retornar URL relativa
        file_url = f"/uploads/{category}/{unique_filename}"

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
        # Limpiar archivo si existe
        if file_path.exists():
            file_path.unlink()

        raise HTTPException(
            status_code=500,
            detail=f"Error al subir archivo: {str(e)}"
        )


@router.delete("/{category}/{filename}")
async def delete_file(category: str, filename: str):
    """
    Elimina un archivo

    Args:
        category: Categoría del archivo
        filename: Nombre del archivo

    Returns:
        dict: Confirmación de eliminación

    Raises:
        HTTPException 404: Si el archivo no existe
        HTTPException 500: Si hay error al eliminar
    """
    try:
        file_path = UPLOAD_DIR / category / filename

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Archivo no encontrado"
            )

        file_path.unlink()

        return {
            "success": True,
            "message": "Archivo eliminado correctamente",
            "filename": filename
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al eliminar archivo: {str(e)}"
        )