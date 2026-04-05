import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import User, Client

async def get_client_by_id(db: AsyncSession, client_id: uuid.UUID, company_id: uuid.UUID) -> User | None:
    stmt = select(Client).where(
        Client.client_id == client_id,
        Client.company_id == company_id
    )
    result = await db.execute(stmt)
    return result.scalars().first()

# async def create_client_in_db(db: AsyncSession, )