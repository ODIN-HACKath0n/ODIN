# backend/app/auth/router.py
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

# Імпортуємо наш C++ рушій
from database import db_engine # ignore
import logistics_core # ignore

router = APIRouter(
    prefix="/auth",
    tags=["Authorization"]
)

class UserRegistrationRequest(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login_user", status_code=status.HTTP_200_OK)
def login_user(user: UserLogin):
    auth_data = db_engine.get_user_auth_data(user.email)

    if not auth_data:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")

    # Перевіряємо хеш засобами Python
    if not check_password_hash(auth_data["password_hash"], user.password):
        raise HTTPException(status_code=401, detail="Неправильний пароль")

    # Тільки після успішної перевірки кажемо C++ зробити користувача онлайн
    db_engine.set_user_online(auth_data["id"])

    return {"message": "Вхід успішний", "role": auth_data["role"]}


@router.post("/register_user", status_code=status.HTTP_201_CREATED)
def register_user(user: UserRegistrationRequest):

    user_id = str(uuid.uuid4())
    hashed_password = generate_password_hash(user.password, method='pbkdf2:sha256')

    existing_user = db_engine.get_person_by_id(user_id)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    db_engine.register_account(user_id, user.email, user.phone, hashed_password, user.role, user.name)

    # 2. Створюємо відповідний об'єкт залежно від посади та передаємо в C++
    try:
        if user.role.upper() == "DIRECTOR":
            d = logistics_core.Director()
            d.id, d.name, d.email, d.phone, d.companyName, d.clearanceLevel = user_id, user.username, user.email, user.phone, "Default Corp", 5
            db_engine.add_director(d)

        elif user.role.upper() == "MANAGER":
            m = logistics_core.Manager()
            m.id, m.name, m.email, m.phone, m.department = user_id, user.username, user.email, user.phone, "General"
            db_engine.add_manager(m)

        elif user.role.upper() == "DRIVER":
            drv = logistics_core.Driver()
            drv.id, drv.name, drv.email, drv.phone, drv.status = user_id, user.username, user.email, user.phone, "IDLE"
            db_engine.add_driver(drv)

        else:
            raise HTTPException(status_code=400, detail="Unknow role")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error C++ Engine: {str(e)}")

    return {"message": "Success register!", "user_id": user_id, "role": user.role}

@router.get("/users", status_code=status.HTTP_200_OK)
def get_users():
    # Викликаємо метод з C++
    staff = db_engine.get_all_online_staff()

    safe_users = []
    for person in staff:
        safe_users.append({
            "id": person.id,
            "name": person.name,
            "role": person.role,  # Роль, яку встановлює C++ клас
            "is_online": person.isOnline
        })

    return {"users": safe_users}