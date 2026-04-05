import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from sqlalchemy.orm import selectinload

from database.schemas import OrderCreate, OrderStatus
from database.models import Order
from crud.client import get_client_by_email, create_client_in_db


async def get_order_by_id(
        db: AsyncSession,
        company_id: uuid.UUID,
        order_id: uuid.UUID
) -> Order | None:

    stmt = (
        select(Order)
        .where(
            Order.order_id == order_id,
            Order.company_id == company_id
        )
        .options(
            selectinload(Order.company),
            selectinload(Order.client)
        )
    )
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_all_orders(
        db: AsyncSession,
        company_id: uuid.UUID,
        skip: int = 0,
        limit: int = 100
) -> Sequence[Order]:
    stmt = (
        select(Order)
        .where(
            Order.company_id == company_id
        )
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

async def create_order_in_db(db: AsyncSession, company_id: uuid.UUID, client_email: str, order: OrderCreate):
    client_id = None
    client_db = await get_client_by_email(db, client_email=client_email ,company_id=company_id)
    if not client_db:
        client_id = uuid.uuid4()
        await create_client_in_db(db, company_id, OrderCreate.client)
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