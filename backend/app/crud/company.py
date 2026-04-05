import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, Sequence
from database.models import Company
from database.schemas import Roles, CompanyCreate

async def create_company(db: AsyncSession, company_data: CompanyCreate) -> Company:

    new_company = Company(
        company_id = uuid.uuid4(),
        company_name = company_data.name,
        registration_number = company_data.registration_number,
        address = company_data.address,
        bank_details = company_data.bank_details,
        corporation_email = company_data.corporation_email,
        domain = company_data.domain,
        manager_id = company_data.manager_id
    )

    db.add(new_company)
    await db.commit()
    await db.refresh(new_company)

    return new_company