from sqlalchemy.orm import Session
from ..database.models import Driver
import uuid


# ==========================================
# 1. READ (Читання даних)
# ==========================================

def get_driver_by_id(db: Session, driver_id: uuid.UUID):
    """Шукає одного водія за його ID (Аналог: SELECT * FROM drivers WHERE user_id = ...)"""
    return db.query(Driver).filter(Driver.user_id == driver_id).first()


def get_all_drivers(db: Session, skip: int = 0, limit: int = 100):
    """Повертає список водіїв з пагінацією (Аналог: SELECT * FROM drivers LIMIT 100 OFFSET 0)"""
    return db.query(Driver).offset(skip).limit(limit).all()


# ==========================================
# 2. CREATE (Створення запису)
# ==========================================

def create_driver(db: Session, dispatcher_id: uuid.UUID, license_type: str, experience_years: int):
    """Створює нового водія в БД (Аналог: INSERT INTO drivers ...)"""

    # Крок 1: Створюємо Python-об'єкт нашої моделі
    new_driver = Driver(
        dispatcher_id=dispatcher_id,
        license_type=license_type,
        experience_years=experience_years,
        status="Free"  # Статус за замовчуванням
    )

    # Крок 2: Додаємо його в сесію (готуємо до відправки)
    db.add(new_driver)

    # Крок 3: Фізично зберігаємо в базу (робимо COMMIT)
    db.commit()

    # Крок 4: Оновлюємо об'єкт, щоб БД повернула нам його згенерований ID
    db.refresh(new_driver)

    return new_driver


# ==========================================
# 3. UPDATE (Оновлення запису)
# ==========================================

def update_driver_status(db: Session, driver_id: uuid.UUID, new_status: str):
    """Змінює статус водія (Аналог: UPDATE drivers SET status = ... WHERE user_id = ...)"""

    # Спочатку знаходимо водія
    driver = get_driver_by_id(db, driver_id)
    if not driver:
        return None  # Якщо такого водія немає

    # Змінюємо поле
    driver.status = new_status

    # Зберігаємо зміни
    db.commit()
    db.refresh(driver)
    return driver


# ==========================================
# 4. DELETE (Видалення запису)
# ==========================================

def delete_driver(db: Session, driver_id: uuid.UUID):
    """Видаляє водія (Аналог: DELETE FROM drivers WHERE user_id = ...)"""
    driver = get_driver_by_id(db, driver_id)
    if driver:
        db.delete(driver)
        db.commit()
        return True
    return False