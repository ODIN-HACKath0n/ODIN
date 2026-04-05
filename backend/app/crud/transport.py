import uuid

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from datetime import date

from database.schemas import TransportCreate
from database.models import Transport, Driver

async def get_transport_by_id(db: AsyncSession, transport_id: uuid.UUID) -> Transport:
    """Шукає транспорт за його ID (Аналог: SELECT * FROM transports WHERE transport_id = ...)"""
    stmt = select(Transport).where(Transport.transport_id == transport_id)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_transport_by_driver(db: AsyncSession, driver_id: uuid.UUID) -> Transport | None:
    """Отримує транспорт, який закріплений за конкретним водієм"""

    # Робимо ОДИН запит: Вибираємо Транспорт, приєднуємо Водія і фільтруємо за ID водія
    stmt = (
        select(Transport)
        .join(Driver, Driver.assigned_truck_id == Transport.truck_id)
        .where(Driver.user_id == driver_id)  # Зверніть увагу: у вашій моделі PK водія це user_id
    )

    result = await db.execute(stmt)
    return result.scalars().first()  # Поверне Transport або None, якщо нічого не знайдено

async def get_all_transports(db: AsyncSession, company_id: uuid.UUID, skip: int = 0, limit: int = 100) -> Sequence[Transport]:
    stmt = (
        select(Transport)
        .where(Transport.company_id == company_id).offset(skip).limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_transport(db: AsyncSession, transport_data: TransportCreate) -> Transport | None:
    new_transport = Transport(
        transport_id=uuid.uuid4(),
        company_id=transport_data.company_id,
        weight_capacity=transport_data.weight_capacity,
        weight=transport_data.weight,
        license_plate=transport_data.license_plate,
        model=transport_data.model,
        dimensions=transport_data.dimensions,
        mileage=transport_data.mileage,
        fuel_consumption_rate=transport_data.fuel_consumption_rate,
        next_maintenance_date=transport_data.next_maintenance_date
    )

    db.add(new_transport)
    await db.commit()
    await db.refresh(new_transport)
    return new_transport

async def update_transport_maintenance(db: AsyncSession, transport_id: uuid.UUID, next_date: date) -> Transport:
    transport_db = await get_transport_by_id(db, transport_id)
    transport_db.next_maintenance_date = next_date
    await db.commit()
    await db.refresh(transport_db)
    return transport_db

async def delete_transport(db: AsyncSession, transport_id: uuid.UUID) -> bool:
    transport_db = await get_transport_by_id(db, transport_id)
    if transport_db:
        await db.delete(transport_db)
        await db.commit()
        return True

    return False