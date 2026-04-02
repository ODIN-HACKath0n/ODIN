from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from werkzeug.security import generate_password_hash, check_password_hash

from database import database as db

router = APIRouter(prefix="/auth", tags=["Авторизація"])

class UserAuthRequest(BaseModel):
    username: str
    password: str
    posada: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserAuthRequest):
    existing_user = db.get_user_by_username(user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Користувач з таким ім'ям вже існує."
        )
    
    hashed_password = generate_password_hash(user.password, method='pbkdf2:sha256')
    
    new_user = db.create_user(user.username, hashed_password)
    
    return {"message": "Реєстрація успішна!", "user_id": new_user["id"]}


@router.post("/login", status_code=status.HTTP_200_OK)
def login(user: UserAuthRequest):
    db_user = db.get_user_by_username(user.username)
    
    if not db_user or not check_password_hash(db_user["password"], user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невірне ім'я користувача або пароль."
        )
    
    return {"message": "Успішний вхід!", "user_id": db_user["id"]}


@router.get("/users", status_code=status.HTTP_200_OK)
def get_users():
    # 1. Отримуємо всіх користувачів з нашої затички
    all_users = db.get_all_users()

    # 2. Створюємо безпечний список без паролів
    safe_users = []

    # all_users - це словник (де ключі - це username, а значення - дані)
    # Тому ми проходимося по його значеннях (values)
    for user_data in all_users.values():
        safe_users.append({
            "id": user_data["id"],
            "posada": user_data["posada"],
            "": user_data["username"],
            "username": user_data["username"]
            # Пароль навмисно не додаємо сюди!
        })

    return {"users": safe_users}