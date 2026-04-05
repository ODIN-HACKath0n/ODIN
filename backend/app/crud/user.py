import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from pydantic import EmailStr

from database.models import User
from database.schemas import UserRegistration

# ==========================================
# 1. READ (Читання записів)
# ==========================================

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User:
    """Шукає одного користувача за його ID (Аналог: SELECT * FROM users WHERE user_id = ...)"""
    stmt = select(User).where(User.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str | EmailStr) -> User:
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_user_by_email_and_company(db: AsyncSession, email: str, company_id: uuid.UUID) -> User:
    stmt = select(User).where(
        User.email == email,
        User.company_id == company_id
    )

    result = await db.execute(stmt)
    return result.scalars().first()

async def get_all_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[User]:
    """Повертає список користувачів з пагінацією (Аналог: SELECT * FROM users LIMIT 100 OFFSET 0)"""
    stmt = select(User).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


# ==========================================
# 2. CREATE (Створення запису)
# ==========================================

async def create_user(db: AsyncSession, user_id: uuid.UUID, company_id: uuid.UUID | None, user_data: UserRegistration):
    """Створює нового користувача в БД (Аналог: INSERT INTO users ...)"""

    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    new_user = User(
        user_id = user_id,
        company_id = company_id,
        first_name = user_data.first_name,
        last_name = user_data.last_name,
        email = user_data.email,
        password = user_data.password,
        phone = user_data.phone,
    )

    # Крок 2: Додаємо його в сесію (це синхронна операція в пам'яті, await не потрібен)
    db.add(new_user)

    # Крок 3: Фізично зберігаємо в базу (робимо COMMIT)
    await db.commit()

    # Крок 4: Оновлюємо об'єкт, щоб БД повернула нам його згенерований ID та інші дефолтні поля
    await db.refresh(new_user)

    return new_user


# ==========================================
# 3. UPDATE (Оновлення запису)
# ==========================================

async def set_user_status(db: AsyncSession, user_id: uuid.UUID, user_status: bool):
    user = await get_user_by_id(db, user_id)
    if not user:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not exists")

    user.is_online = user_status

    await db.commit()
    await db.refresh(user)
    return user

async def set_user_company(db: AsyncSession, company_id: uuid.UUID, user_db: User):
    if user_db.company_id:
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already registered to company")
    user_db.company_id = company_id

    await db.commit()
    await db.refresh(user_db)
    return user_db

# ==========================================
# 4. DELETE (Видалення запису)
# ==========================================

async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> bool:
    """Видаляє користувача (Аналог: DELETE FROM users WHERE user_id = ...)"""
    user = await get_user_by_id(db, user_id)
    if user:
        # Видалення з сесії (await не потрібен)
        await db.delete(user)
        # Фіксуємо транзакцію в базі
        await db.commit()
        return True
    return False