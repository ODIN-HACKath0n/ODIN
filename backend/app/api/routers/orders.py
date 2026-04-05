import uuid
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, Roles
from core.dependencies import get_current_user
from database.schemas import OrderDataResponse, OrderCreate
from crud.order import (
    get_order_by_id,
    get_all_orders,
    create_order_in_db
)

router = APIRouter(
    prefix="/api/v1/orders",
    tags=["Orders"]
)

@router.get("/", status_code=status.HTTP_200_OK)
async def get_orders(
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    orders = await get_all_orders(db, current_user.company_id ,skip=skip, limit=limit)
    return {"message": "Success", "orders": orders}

@router.get("/{order_id}", status_code=status.HTTP_200_OK, response_model=OrderDataResponse)
async def get_order(
        order_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    order_db = await get_order_by_id(db, current_user.company_id ,order_id=order_id)

    if not order_db:
        raise HTTPException(status_code=404, detail="Order not found")

    return {"message": "Success", "order_data": order_db}

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_order(
        company_data: OrderCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if current_user.role not in [Roles.MANAGER, Roles.TECH_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Manager can create new order."
        )
    order_db = await create_order_in_db(db, current_user.company_id, u, order: OrderCreate)
    if not manager_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {company_data.manager_id} not found."
        )

    new_company = await create_company(db=db, company_data=company_data)

    if not new_company:
        raise HTTPException(status_code=400, detail="Failed to create company")

    return {
        "message": "Company created successfully",
        "company_data": new_company
    }