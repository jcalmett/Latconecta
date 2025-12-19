from app.database import SessionLocal
from app.models import User
from app.utils.auth import get_password_hash

db = SessionLocal()

# Actualizar admin
admin = db.query(User).filter(User.user_email == 'admin@bitel.com.pe').first()
if admin:
    admin.user_password = get_password_hash('admin123')
    print(f"Admin actualizado: {admin.user_email}")

# Actualizar juan
juan = db.query(User).filter(User.user_email == 'juan@email.com').first()
if juan:
    juan.user_password = get_password_hash('admin123')
    print(f"Juan actualizado: {juan.user_email}")