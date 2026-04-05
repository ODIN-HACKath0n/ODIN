import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence

# Припускаємо, що у вас є модель User та відповідні схеми/ролі
from database.models import User
from database.schemas import Roles


# ==========================================
# 1. READ (Читання даних)
# ==========================================

async def get_manager_by_id(db: AsyncSession, manager_id: uuid.UUID) -> User:
    """Шукає одного менеджера за його ID (Аналог: SELECT * FROM users WHERE user_id = ... AND role = 'MANAGER')"""
    stmt = select(User).where(
        User.user_id == manager_id,
        User.role == Roles.MANAGER  # Або "MANAGER", якщо не використовуєте Enum
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_managers(db: AsyncSession, company_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[User]:
    """Повертає список менеджерів компанії з пагінацією"""
    stmt = (
        select(User)
        .where(
            User.company_id == company_id,
            User.role == Roles.MANAGER
        )
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


# ==========================================
# 2. CREATE (Створення запису)
# ==========================================

async def create_manager(
        db: AsyncSession,
        company_id: uuid.UUID,
        first_name: str,
        last_name: str,
        email: str,
        password: str,  # Пароль має бути захешованим до передачі сюди!
        phone: str
) -> User:
    """Створює нового менеджера (користувача з роллю MANAGER) в БД"""

    new_manager = User(
        user_id=uuid.uuid4(),
        company_id=company_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password,
        phone=phone,
        role=Roles.MANAGER,  # Жорстко задаємо роль
        is_online=False
    )

    db.add(new_manager)
    await db.commit()
    await db.refresh(new_manager)

    return new_manager


# ==========================================
# 3. UPDATE (Оновлення запису)
# ==========================================

async def update_manager_info(
        db: AsyncSession,
        manager_id: uuid.UUID,
        first_name: str = None,
        last_name: str = None,
        phone: str = None
) -> User:
    """Оновлює контактні дані менеджера"""
    manager = await get_manager_by_id(db, manager_id)
    if not manager:
        return None

    if first_name:
        manager.first_name = first_name
    if last_name:
        manager.last_name = last_name
    if phone:
        manager.phone = phone

    await db.commit()
    await db.refresh(manager)
    return manager


# ==========================================
# 4. DELETE (Видалення запису)
# ==========================================

async def delete_manager(db: AsyncSession, manager_id: uuid.UUID) -> bool:
    """Видаляє менеджера з системи"""
    manager = await get_manager_by_id(db, manager_id)

    if manager:
        await db.delete(manager)
        await db.commit()
        return True

    return False