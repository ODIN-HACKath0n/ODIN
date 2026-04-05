import uuid
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# Ваші імпорти (шляхи можуть трохи відрізнятися залежно від папок)
from database.session import get_db
from database.models import User
from core.dependencies import get_current_user
from database.schemas import DriverCreate, Roles, DriverDataResponse
from crud.driver import set_driver_transport
from crud.driver import (
    get_all_drivers,
    get_driver_by_id,
    create_driver,
    delete_driver
)

router = APIRouter(
    prefix="/api/v1/drivers",
    tags=["Drivers"]
)


@router.get("/", status_code=status.HTTP_200_OK)
async def get_drivers(
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    """Отримати список всіх водіїв компанії"""
    # Викликаємо асинхронну CRUD функцію
    drivers = await get_all_drivers(db, current_user.company_id ,skip=skip, limit=limit)
    return {"message": "Success", "drivers": drivers}


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_driver(
        driver_data: DriverCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    """Створити нового водія"""
    # Перевірка прав доступу: чи має право ця людина наймати водіїв?
    if current_user.role not in [Roles.MANAGER.value, Roles.DIRECTOR.value]:
        raise HTTPException(status_code=403, detail="Not enough privileges to add a driver")

    # Створюємо водія через CRUD
    new_driver = await create_driver(
        db=db,
        user_id=driver_data.user_id,
        dispatcher_id=driver_data.dispatcher_id,
        license_type=driver_data.license_type,
        experience_years=driver_data.experience_years
    )
    return {"message": "Driver created successfully", "driver_data": new_driver}

@router.patch("/{driver_id}/transport", status_code=status.HTTP_202_ACCEPTED)
async def update_driver_transport(
        driver_id: uuid.UUID,
        transport_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if current_user.role not in [Roles.MANAGER.value, Roles.MANAGER.value]:
        raise HTTPException(status_code=403, detail="Not enough privileges to change a driver transport")

    driver = await get_driver_by_id(db, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if driver.company_id != current_user.company_id:
        raise HTTPException(status_code=403, detail="Not enough privileges to change driver transport")

    driver = await set_driver_transport(db, driver, transport_id)
    return {"message": "Driver set transport successfully", "driver_data": driver}

@router.get("/{driver_id}", status_code=status.HTTP_200_OK, response_model=DriverDataResponse)
async def get_driver(
        driver_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    """Отримати дані конкретного водія за його ID"""
    driver = await get_driver_by_id(db, driver_id)

    if not driver:
        # Якщо CRUD повернув None (водія немає) - кидаємо 404 помилку
        raise HTTPException(status_code=404, detail="Driver not found")

    return {"message": "Success", "driver_data": driver}


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_driver(
        driver_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)  # Захист!
):
    """Звільнити (видалити) водія"""
    # Перевірка прав
    if current_user.role not in ["MANAGER", "DIRECTOR"]:
        raise HTTPException(status_code=403, detail="Not enough privileges to delete a driver")

    # Спроба видалити
    is_deleted = await delete_driver(db, driver_id)

    if not is_deleted:
        raise HTTPException(status_code=404, detail="Driver not found or already deleted")

    # Статус 204 вимагає порожньої відповіді
    return None