# backend/app/auth/router.py
import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.asyncio import AsyncSession
from database.session import get_db
from database.schemas import UserLogout, UserRegistration, UserLogin
from crud.user import create_user, get_user_by_email, set_user_status
from core.dependencies import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authorization"]
)

@router.post("/login_user", status_code=status.HTTP_200_OK)
async def login_user(user: UserLogin, db: AsyncSession = Depends(get_db)):
    db_user = await get_user_by_email(db, email=user.email)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")  # RAISE!

    if not check_password_hash(db_user.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password")  # RAISE!

    db_user.is_online = True
    await db.commit()

    # ГЕНЕРУЄМО ТОКЕН
    access_token = create_access_token(data={"sub": str(db_user.user_id)})

    # FastAPI очікує саме такий формат для OAuth2
    return {"access_token": access_token, "token_type": "bearer", "role": db_user.role}

@router.post("/register_user", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserRegistration, db: AsyncSession = Depends(get_db)):
    user_id = uuid.uuid4()
    hashed_password = generate_password_hash(user.password, method='pbkdf2:sha256')
    user_db = await create_user(
        db=db,
        user_id=user_id,
        company_id=None,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
        phone=user.phone,
    )
    if isinstance(user_db, HTTPException):
        raise user_db
    return {"message": "Create user in successfully", "user_data": user_db}

@router.post("/logout_user", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(user_data: UserLogout, db: AsyncSession = Depends(get_db)):
    user_db = await set_user_status(db=db, user_id=user_data.user_id, user_status=False)
    if isinstance(user_db, HTTPException):
        raise user_db
    return {"message": "Logout successfully", "user_data": user_db}
