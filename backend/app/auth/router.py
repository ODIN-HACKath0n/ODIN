# backend/app/auth/router.py
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from database.session import get_db
from database.models import User
from crud.user import create_user

router = APIRouter(
    prefix="/auth",
    tags=["Authorization"]
)

class UserRegistration(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str

@router.post("/login_user", status_code=status.HTTP_200_OK)
async def login_user(user: UserLogin, db: AsyncSession = Depends(get_db)):
    stml = select(User).where(User.email == user.email)
    result = await db.execute(stml)
    db_user = result.scalars().first()
    if not db_user:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if not check_password_hash(db_user.password, user.password):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incorrect password")

    db_user.is_online = True
    await db.commit()
    return {"message": "Logged in successfully", "role": db_user.role}

@router.post("/register_user", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegistration, db: AsyncSession = Depends(get_db)):
    user_id = uuid.uuid4()
    hashed_password = generate_password_hash(user.password, method='pbkdf2:sha256')
    user_db = await create_user(
        db=db,
        user_id=user_id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
        phone=user.phone,
    )
    return {"message": "Create user in successfully", "user_data": user_db}

# @router.post("/register_user", status_code=status.HTTP_201_CREATED)
# def register_user(user: UserRegistrationRequest):
#
#     user_id = str(uuid.uuid4())
#     hashed_password = generate_password_hash(user.password, method='pbkdf2:sha256')
#
#     existing_user = db_engine.get_person_by_id(user_id)
#     if existing_user:
#         raise HTTPException(status_code=400, detail="User already exists")
#
#     db_engine.register_account(user_id, user.email, user.phone, hashed_password, user.role, user.name)
#
#     # 2. Створюємо відповідний об'єкт залежно від посади та передаємо в C++
#     try:
#         if user.role.upper() == "DIRECTOR":
#             d = logistics_core.Director()
#             d.id, d.name, d.email, d.phone, d.companyName, d.clearanceLevel = user_id, user.username, user.email, user.phone, "Default Corp", 5
#             db_engine.add_director(d)
#
#         elif user.role.upper() == "MANAGER":
#             m = logistics_core.Manager()
#             m.id, m.name, m.email, m.phone, m.department = user_id, user.username, user.email, user.phone, "General"
#             db_engine.add_manager(m)
#
#         elif user.role.upper() == "DRIVER":
#             drv = logistics_core.Driver()
#             drv.id, drv.name, drv.email, drv.phone, drv.status = user_id, user.username, user.email, user.phone, "IDLE"
#             db_engine.add_driver(drv)
#
#         else:
#             raise HTTPException(status_code=400, detail="Unknow role")
#
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Error C++ Engine: {str(e)}")
#
#     return {"message": "Success register!", "user_id": user_id, "role": user.role}
#
# @router.get("/users", status_code=status.HTTP_200_OK)
# def get_users():
#     # Викликаємо метод з C++
#     staff = db_engine.get_all_online_staff()
#
#     safe_users = []
#     for person in staff:
#         safe_users.append({
#             "id": person.id,
#             "name": person.name,
#             "role": person.role,  # Роль, яку встановлює C++ клас
#             "is_online": person.isOnline
#         })
#
#     return {"users": safe_users}