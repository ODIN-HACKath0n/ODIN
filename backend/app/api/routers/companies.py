import uuid
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from database.session import get_db
from database.models import User
from database.schemas import CompanyCreate, Roles

from crud.company import create_company
from crud.user import get_user_by_email, get_user_by_email_and_company, set_user_company, get_user_by_id
from core.dependencies import get_current_user

router = APIRouter(
    prefix="/companies",
    tags=["Companies"],
)

@router.post("/register_company", status_code=status.HTTP_201_CREATED)
async def register_company(
        company_data: CompanyCreate,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if current_user.role != Roles.TECH_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Tech Admin can create new companies."
        )
    manager_user = await get_user_by_id(db, user_id=company_data.manager_id)
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

@router.post("/register_employee", status_code=status.HTTP_201_CREATED)
async def register_employee(
        company_id: uuid.UUID,
        user_email: EmailStr,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # ПЕРЕВІРКА ПРАВ ДОСТУПУ (Авторизація)
    # 1. Чи належить той, хто робить запит, до цієї компанії?
    if current_user.company_id != company_id:
        raise HTTPException(status_code=403, detail="You do not have access to this company")

    # 2. Чи є в нього права це робити? (наприклад, тільки Менеджер або Директор)
    if current_user.role not in ["MANAGER", "DIRECTOR"]:
        raise HTTPException(status_code=403, detail="Not enough privileges")

    # --- Ваш старий код залишається без змін ---
    user_db = await get_user_by_email(db, email=user_email)
    if isinstance(user_db, HTTPException):
        raise user_db

    user_db = await set_user_company(db=db, company_id=company_id, user_db=user_db)
    if isinstance(user_db, HTTPException):
        raise user_db

    return {"message": "Create employee successfully", "user_data": user_db}

@router.get("/employee", status_code=status.HTTP_200_OK)
async def get_employee(company_id: uuid.UUID, email: str, db: AsyncSession = Depends(get_db)):
    user_db = await get_user_by_email_and_company(db, email=email, company_id=company_id)
    if isinstance(user_db, HTTPException):
        raise user_db
    return {"message": "Get employee in successfully", "user_data": user_db}