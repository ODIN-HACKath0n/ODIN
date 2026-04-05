import uuid
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User, Roles
from core.dependencies import get_current_user
from database.schemas import ClientDataResponse, ClientCreate
from crud.client import (
    get_client_by_id,
    get_client_by_email,
    get_clients_in_db,
    create_client_in_db
)

router = APIRouter(
    prefix="/api/v1/clients",
    tags=["Clients"]
)

@router.get("/by_email", status_code=status.HTTP_200_OK)
async def get_client(
        client_email: str,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    client_db = await get_client_by_email(db, current_user.company_id ,client_email)
    return {"message": "Success", "client_data": client_db}

@router.get("/by_id", status_code=status.HTTP_200_OK)
async def get_client(
        client_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    client_db = await get_client_by_id(db, current_user.company_id ,client_id)
    return {"message": "Success", "client_data": client_db}

@router.get("/{client_id}", status_code=status.HTTP_200_OK, response_model=ClientDataResponse)
async def get_clients(
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    client_db = await get_clients_in_db(db, current_user.company_id, skip=skip, limit=limit)

    if not client_db:
        raise HTTPException(status_code=404, detail="Client not found")

    return {"message": "Success", "clients_data": client_db}

@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_client(
        client_data: ClientCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if current_user.role not in [Roles.MANAGER, Roles.TECH_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Manager can create new client."
        )
    client_db = await create_client_in_db(db, company_id=current_user.company_id,client_data=client_data)
    if not client_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error while creating client."
        )

    return {
        "message": "Client created successfully",
        "order_data": client_db
    }