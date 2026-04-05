import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from sqlalchemy.orm import selectinload

from database.schemas import OrderCreate, OrderStatus
from database.models import Order

async def get_order_by_id(db: AsyncSession, company_id: uuid.UUID, order_id: uuid.UUID) -> Order:
    stmt = (
        select(Order)
        .where(Order.order_id == order_id)
        .options(
            selectinload(Order.company),
            selectinload(Order.client)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().first()

async def get_all_orders(db: AsyncSession, order_id: uuid.UUID , skip: int = 0, limit: int = 100) -> Sequence[Order]:
    stmt = (
        select(Transport)
        .join(Driver, Driver.assigned_truck_id == Transport.truck_id)
        .where(Driver.user_id == driver_id)  # Зверніть увагу: у вашій моделі PK водія це user_id
    )

async def create_order(db: AsyncSession, company_id: uuid.UUID, client_id: uuid.UUID, order: OrderCreate):
    new_order = Order(
        order_id=uuid.uuid4(),
        company_id =company_id,
        client_id=client_id,
        priority = order.priority,
        status =OrderStatus.CONFIRMED,
        cargo_description =order.cargo_description,
        weight =order.weight,
        volume =order.volume,
        quantity =order.quantity,
        price =order.price,
        created_at =order.created_at,
        deadline =order.deadline,
        pickup_address = order.pickup_address,
        delivery_address = order.delivery_address
    )
    db.add(new_order)
    await db.commit()
    await db.refresh(new_order)
    return new_order