"""
Configuración de pytest y fixtures
Define configuración común para todos los tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models import User, Company, Service, Product
from app.utils.auth import get_password_hash

# Base de datos en memoria para tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """
    Crea una nueva sesión de base de datos para cada test
    Se limpia después de cada test
    """
    # Crear las tablas
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    
    # Insertar datos de prueba básicos
    _seed_test_data(session)
    
    try:
        yield session
    finally:
        session.close()
        # Limpiar las tablas después del test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """
    Crea un cliente de prueba de FastAPI
    Usa la base de datos de prueba en lugar de la real
    """
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def admin_token(client):
    """
    Obtiene un token JWT de admin para tests
    """
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin@test.com",
            "password": "testpass123"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
def user_token(client):
    """
    Obtiene un token JWT de usuario regular para tests
    """
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "user@test.com",
            "password": "testpass123"
        }
    )
    return response.json()["access_token"]


@pytest.fixture
def auth_headers_admin(admin_token):
    """
    Headers de autenticación para admin
    """
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def auth_headers_user(user_token):
    """
    Headers de autenticación para usuario regular
    """
    return {"Authorization": f"Bearer {user_token}"}


def _seed_test_data(session):
    """
    Inserta datos de prueba en la base de datos
    """
    # Crear compañía
    company = Company(
        company_id=1,
        company_name="Bitel Test",
        company_lema_1="Test Lema",
        company_status="active"
    )
    session.add(company)
    
    # Crear usuarios de prueba
    admin_user = User(
        user_id=1,
        user_name="Admin Test",
        user_email="admin@test.com",
        user_password=get_password_hash("testpass123"),
        user_role="admin",
        user_status="active"
    )
    
    regular_user = User(
        user_id=2,
        user_name="User Test",
        user_email="user@test.com",
        user_password=get_password_hash("testpass123"),
        user_role="user",
        user_status="active"
    )
    
    session.add(admin_user)
    session.add(regular_user)
    
    # Crear servicio de prueba
    service = Service(
        service_id=1,
        service_name="Test Service",
        service_description="Service for testing",
        status="active"
    )
    session.add(service)
    
    # Crear producto de prueba
    product = Product(
        product_id=1,
        service_id=1,
        product_code="TEST-001",
        product_name="Test Product",
        product_base_price=10.00,
        product_total_price=11.00,
        product_status="active"
    )
    session.add(product)
    
    session.commit()
