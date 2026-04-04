import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database.models import User  # Використовуємо абсолютний імпорт

# ==========================================
# 1. READ (Читання записів)
# ==========================================

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID):
    """Шукає одного користувача за його ID (Аналог: SELECT * FROM users WHERE user_id = ...)"""
    stmt = select(User).where(User.user_id == user_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Повертає список користувачів з пагінацією (Аналог: SELECT * FROM users LIMIT 100 OFFSET 0)"""
    stmt = select(User).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


# ==========================================
# 2. CREATE (Створення запису)
# ==========================================

async def create_user(db: AsyncSession, user_id: uuid.UUID, first_name: str, last_name: str, email: str, password: str, phone: str):
    """Створює нового користувача в БД (Аналог: INSERT INTO users ...)"""

    existing_user = await get_user_by_id(db, user_id)
    if existing_user:
        raise ValueError(f"User with email '{email}' already exists")

    new_user = User(
        user_id = user_id,
        first_name = first_name,
        last_name = last_name,
        email = email,
        password = password,
        phone = phone,
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

async def update_user_status(db: AsyncSession, user_id: uuid.UUID, new_status: str):
    """Змінює статус користувача (Аналог: UPDATE users SET is_online = ... WHERE user_id = ...)"""

    # Спочатку знаходимо користувача
    user = await get_user_by_id(db, user_id)
    if not user:
        return None  # Якщо такого користувача немає

    # Змінюємо поле (це просто зміна атрибута об'єкта в пам'яті)
    user.is_online = new_status

    # Зберігаємо зміни
    await db.commit()
    await db.refresh(user)
    return user


# ==========================================
# 4. DELETE (Видалення запису)
# ==========================================

async def delete_user(db: AsyncSession, user_id: uuid.UUID):
    """Видаляє користувача (Аналог: DELETE FROM users WHERE user_id = ...)"""
    user = await get_user_by_id(db, user_id)
    if user:
        # Видалення з сесії (await не потрібен)
        await db.delete(user)
        # Фіксуємо транзакцію в базі
        await db.commit()
        return True
    return False