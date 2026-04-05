import uuid
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User
from database.schemas import Roles
from core.dependencies import get_current_user

# Імпортуємо наші функції з файлу crud/director.py
from crud.director import (
    get_all_directors,
    get_director_by_id,
    set_director_role,
    remove_director_role
)

router = APIRouter(
    prefix="/api/v1/directors",
    tags=["Directors"]
)


@router.get("/", status_code=status.HTTP_200_OK)
async def list_directors(
        skip: int = 0,
        limit: int = 100,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Отримати список всіх директорів компанії"""
    # Компанія береться з токена current_user, щоб не підглядати в чужі компанії
    directors = await get_all_directors(db, company_id=current_user.company_id, skip=skip, limit=limit)
    return {"directors": directors}


@router.post("/{user_id}", status_code=status.HTTP_201_CREATED)
async def promote_to_director(
        user_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Призначити користувача директором (тільки для діючих директорів)"""
    if current_user.role != Roles.DIRECTOR:
        raise HTTPException(status_code=403, detail="Only directors can promote others to directors")

    updated_user = await set_director_role(db, user_id=user_id, company_id=current_user.company_id)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found in your company")

    return {"message": "User promoted to Director", "user": updated_user}


@router.get("/{director_id}", status_code=status.HTTP_200_OK)
async def get_single_director(
        director_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Отримати дані конкретного директора"""
    director = await get_director_by_id(db, director_id, company_id=current_user.company_id)
    if not director:
        raise HTTPException(status_code=404, detail="Director not found")
    return director


@router.delete("/{director_id}", status_code=status.HTTP_204_NO_CONTENT)
async def fire_director(
        director_id: uuid.UUID,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    """Зняти роль директора"""
    if current_user.role != Roles.DIRECTOR:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    # Не даємо директору звільнити самого себе через цей роутер (опціонально)
    if director_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="You cannot fire yourself")

    result = await remove_director_role(db, director_id, company_id=current_user.company_id)
    if not result:
        raise HTTPException(status_code=404, detail="Director not found")

    return None