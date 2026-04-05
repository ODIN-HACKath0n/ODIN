import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from database.models import User
from database.schemas import Roles


async def get_director_by_id(db: AsyncSession, director_id: uuid.UUID, company_id: uuid.UUID) -> User:
    """Шукає директора конкретної компанії"""
    stmt = select(User).where(
        User.user_id == director_id,
        User.role == Roles.DIRECTOR,
        User.company_id == company_id
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_directors(db: AsyncSession, company_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[User]:
    """Повертає список всіх директорів вашої компанії"""
    stmt = select(User).where(
        User.role == Roles.DIRECTOR,
        User.company_id == company_id
    ).offset(skip).limit(limit)

    result = await db.execute(stmt)
    return result.scalars().all()


async def set_director_role(db: AsyncSession, user_id: uuid.UUID, company_id: uuid.UUID):
    """Призначає існуючого користувача вашої компанії директором"""
    # Шукаємо користувача (він має належати до тієї ж компанії)
    stmt = select(User).where(User.user_id == user_id, User.company_id == company_id)
    result = await db.execute(stmt)
    user_db = result.scalars().first()

    if not user_db:
        return None

    user_db.role = Roles.DIRECTOR
    await db.commit()
    await db.refresh(user_db)
    return user_db


async def remove_director_role(db: AsyncSession, director_id: uuid.UUID, company_id: uuid.UUID):
    """Знімає роль директора (звільняє)"""
    user_db = await get_director_by_id(db, director_id, company_id)
    if not user_db:
        return None

    user_db.role = Roles.NONE  # або інша роль за замовчуванням
    await db.commit()
    await db.refresh(user_db)
    return user_db