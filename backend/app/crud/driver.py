import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from sqlalchemy.orm import selectinload

from database.models import Driver


# ==========================================
# 1. READ (Читання даних)
# ==========================================

async def get_driver_by_id(db: AsyncSession, driver_id: uuid.UUID) -> Driver:
    """Шукає одного водія за його ID (Аналог: SELECT * FROM drivers WHERE user_id = ...)"""
    stmt = select(Driver).where(Driver.user_id == driver_id).options(selectinload(Driver.user))
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_drivers(db: AsyncSession, company_id: uuid.UUID , skip: int = 0, limit: int = 100) -> Sequence[Driver]:
    """Повертає список водіїв з пагінацією (Аналог: SELECT * FROM drivers LIMIT 100 OFFSET 0)"""
    stmt = (
        select(Driver)
        .where(Driver.company_id == company_id).offset(skip).limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


# ==========================================
# 2. CREATE (Створення запису)
# ==========================================

async def create_driver(db: AsyncSession, user_id: uuid.UUID, dispatcher_id: uuid.UUID, license_type: str,
                        experience_years: int) -> Driver:
    """Створює нового водія в БД (Аналог: INSERT INTO drivers ...)"""

    # Зверніть увагу: я додав user_id як обов'язкове поле, бо це Primary Key
    new_driver = Driver(
        user_id=user_id,
        dispatcher_id=dispatcher_id,
        license_type=license_type,
        experience_years=experience_years,
        status="Free"  # Статус за замовчуванням
    )

    # Додаємо в сесію (синхронно)
    db.add(new_driver)

    # Фізично зберігаємо в базу (асинхронно)
    await db.commit()

    # Оновлюємо об'єкт (асинхронно)
    await db.refresh(new_driver)

    return new_driver


# ==========================================
# 3. UPDATE (Оновлення запису)
# ==========================================

async def update_driver_status(db: AsyncSession, driver_id: uuid.UUID, new_status: str):
    """Змінює статус водія (Аналог: UPDATE drivers SET status = ... WHERE user_id = ...)"""

    # Спочатку знаходимо водія (асинхронно)
    driver = await get_driver_by_id(db, driver_id)
    if not driver:
        return None  # Якщо такого водія немає

    # Змінюємо поле в пам'яті
    driver.status = new_status

    # Зберігаємо зміни (асинхронно)
    await db.commit()
    await db.refresh(driver)
    return driver

async def set_driver_transport(db: AsyncSession, driver_db: Driver, new_transport: uuid.UUID):
    """Змінює транспорт водія (Аналог: UPDATE drivers SET transport_id = ... WHERE user_id = ...)"""

    # Змінюємо поле в пам'яті
    driver_db.assigned_transport_id = new_transport

    # Зберігаємо зміни (асинхронно)
    await db.commit()
    await db.refresh(driver_db)
    return driver_db

# ==========================================
# 4. DELETE (Видалення запису)
# ==========================================

async def delete_driver(db: AsyncSession, driver_id: uuid.UUID) -> bool:
    """Видаляє водія (Аналог: DELETE FROM drivers WHERE user_id = ...)"""
    # Знаходимо водія (асинхронно)
    driver = await get_driver_by_id(db, driver_id)

    if driver:
        # Видаляємо та комітимо (асинхронно)
        await db.delete(driver)
        await db.commit()
        return True

    return False