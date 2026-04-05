import uuid
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User
from core.dependencies import get_current_user
from database.schemas import ManagerCreate, ManagerUpdate, Roles, ManagerDataResponse # Створіть ці схеми, якщо їх ще немає

from crud.manager import (
    get_all_managers,
    get_manager_by_id,
    create_manager,
    update_manager_info,
    delete_manager
)

router = APIRouter(
    prefix="/api/v1/managers",
    tags=["Managers"]
)

@router.get("/", status_code=status.HTTP_200_OK)
async def get_managers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримати список всіх менеджерів компанії"""
    # Доступ може мати директор або інші менеджери
    if current_user.role not in [Roles.DIRECTOR, Roles.MANAGER]:
         raise HTTPException(status_code=403, detail="Not enough privileges to view managers")

    managers = await get_all_managers(db, current_user.company_id, skip=skip, limit=limit)
    return {"message": "Success", "managers": managers}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_manager(
    manager_data: ManagerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Створити нового менеджера (тільки для DIRECTOR)"""
    if current_user.role != Roles.DIRECTOR:
        raise HTTPException(status_code=403, detail="Only a director can add new managers")

    # Перевірка, чи не зайнятий email виноситься на рівень сервісу або нижче,
    # але припускаємо, що це валідується в ManagerCreate

    new_manager = await create_manager(
        db=db,
        company_id=current_user.company_id,
        first_name=manager_data.first_name,
        last_name=manager_data.last_name,
        email=manager_data.email,
        password=manager_data.password, # Важливо: переконайтеся, що ви хешуєте пароль!
        phone=manager_data.phone
    )
    return {"message": "Manager created successfully", "manager_data": new_manager}


@router.get("/{manager_id}", status_code=status.HTTP_200_OK, response_model=ManagerDataResponse)
async def get_manager(
    manager_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Отримати дані конкретного менеджера за його ID"""
    manager = await get_manager_by_id(db, manager_id)

    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")

    # Перевірка: чи належить менеджер до тієї ж компанії
    if manager.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not enough privileges to view this manager")

    return {"message": "Success", "manager_data": manager}


@router.patch("/{manager_id}", status_code=status.HTTP_202_ACCEPTED)
async def update_manager(
    manager_id: uuid.UUID,
    update_data: ManagerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Оновити інформацію про менеджера"""
    # Директор може оновлювати будь-кого, менеджер - тільки себе
    if current_user.role != Roles.DIRECTOR and current_user.user_id != manager_id:
        raise HTTPException(status_code=403, detail="Not enough privileges to update this manager")

    manager = await update_manager_info(
        db=db,
        manager_id=manager_id,
        first_name=update_data.first_name,
        last_name=update_data.last_name,
        phone=update_data.phone
    )

    if not manager:
         raise HTTPException(status_code=404, detail="Manager not found")

    return {"message": "Manager updated successfully", "manager_data": manager}


@router.delete("/{manager_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_manager(
    manager_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Видалити менеджера (тільки для DIRECTOR)"""
    if current_user.role != Roles.DIRECTOR:
        raise HTTPException(status_code=403, detail="Only a director can delete a manager")

    is_deleted = await delete_manager(db, manager_id)

    if not is_deleted:
        raise HTTPException(status_code=404, detail="Manager not found or already deleted")

    return None