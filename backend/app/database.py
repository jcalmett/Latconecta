"""
Configuración de la base de datos PostgreSQL
Maneja la conexión a la base de datos usando SQLAlchemy (Async)
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Convertir URL de PostgreSQL síncrono a asíncrono
# postgresql:// -> postgresql+asyncpg://
DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", 
    "postgresql+asyncpg://"
)

# Crear el engine asíncrono de SQLAlchemy
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)

# Crear AsyncSessionLocal para las transacciones
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base declarativa para los modelos
Base = declarative_base()

# Dependency para obtener la sesión de base de datos
async def get_db():
    """
    Dependency que proporciona una sesión de base de datos asíncrona
    y se asegura de cerrarla después de cada request
    """
    async with AsyncSessionLocal() as session:
        yield session