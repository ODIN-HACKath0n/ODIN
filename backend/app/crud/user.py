from sqlalchemy.orm import Session
from ..database.models import User
import uuid

def get_user_by_id(db: Session, user_id: uuid.UUID):
    """Шукає одного водія за його ID (Аналог: SELECT * FROM users WHERE user_id = ...)"""
    return db.query(User).filter(User.user_id == user_id).first()


def get_all_users(db: Session, skip: int = 0, limit: int = 100):
    """Повертає список водіїв з пагінацією (Аналог: SELECT * FROM users LIMIT 100 OFFSET 0)"""
    return db.query(User).offset(skip).limit(limit).all()


# ==========================================
# 2. CREATE (Створення запису)
# ==========================================

def create_user(db: Session, user_id: uuid.UUID, first_name: str, last_name: str, email: str, password: str, phone: str):
    """Створює нового користувача в БД (Аналог: INSERT INTO users ...)"""

    existing_user = db.query(User).filter(User.email == email).first()
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

    # Крок 2: Додаємо його в сесію (готуємо до відправки)
    db.add(new_user)

    # Крок 3: Фізично зберігаємо в базу (робимо COMMIT)
    db.commit()

    # Крок 4: Оновлюємо об'єкт, щоб БД повернула нам його згенерований ID
    db.refresh(new_user)

    return new_user


# ==========================================
# 3. UPDATE (Оновлення запису)
# ==========================================

def update_driver_status(db: Session, driver_id: uuid.UUID, new_status: str):
    """Змінює статус водія (Аналог: UPDATE drivers SET status = ... WHERE user_id = ...)"""

    # Спочатку знаходимо водія
    driver = get_user_by_id(db, driver_id)
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

def delete_user(db: Session, user_id: uuid.UUID):
    """Видаляє користувача (Аналог: DELETE FROM users WHERE user_id = ...)"""
    driver = get_user_by_id(db, user_id)
    if driver:
        db.delete(driver)
        db.commit()
        return True
    return False