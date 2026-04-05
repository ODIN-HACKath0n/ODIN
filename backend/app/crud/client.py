import uuid
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from database.models import User, Client
from database.schemas import ClientCreate

async def get_client_by_id(db: AsyncSession, client_id: uuid.UUID, company_id: uuid.UUID) -> User | None:
    stmt = select(Client).where(
        Client.client_id == client_id,
        Client.company_id == company_id
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_client_by_email(db: AsyncSession, company_id: uuid.UUID , client_email: str | EmailStr) -> User | None:
    stmt = select(Client).where(
        Client.email == client_email,
        Client.company_id == company_id
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_clients_in_db(db: AsyncSession, company_id: uuid.UUID, skip = 0, limit = 100) -> Sequence[Client]:
    stmt = select(Client).where(Client.company_id == company_id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_client_in_db(db: AsyncSession, company_id: uuid.UUID, client_data: ClientCreate) -> User | None:
    new_client = Client(
        company_id=company_id,
        company_name=client_data.company_name,
        contact_person=client_data.contact_person,
        phone=client_data.phone,
        email=client_data.email,
        billing_address=client_data.billing_address
    )
    db.add(new_client)
    await db.commit()
    await db.refresh(new_client)
    return new_client