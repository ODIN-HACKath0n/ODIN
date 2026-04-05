from datetime import date

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from decimal import Decimal
import uuid
import enum

class Roles(enum.Enum):
    NONE = "NONE"
    DIRECTOR = "DIRECTOR"
    MANAGER = "MANAGER"
    DISPATCHER = "DISPATCHER"
    DRIVER = "DRIVER"
    TECH_ADMIN = "TECH_ADMIN"

class Status(enum.Enum):
    ACTIVE = "ACTIVE"
    IDLE = "IDLE"
    BUSY = "BUSY"
    IN_TRANSIT = "IN_TRANSIT"
    IS_UNLOADED = "IS_UNLOADED"

# --- СХЕМИ ВОДІЇВ ---
class DriverCreate(BaseModel):
    user_id: uuid.UUID         # ID юзера, якого ми робимо водієм
    dispatcher_id: uuid.UUID   # ID диспетчера, який ним керуватиме
    license_type: str          # Наприклад, "CE"
    experience_years: int      # Стаж роботи

class DriverResponse(BaseModel):
    user_id: uuid.UUID
    assigned_transport_id: uuid.UUID | None = None
    dispatcher_id: uuid.UUID | None = None
    license_type: str | None = None
    experience_years: int | None = None
    status: str

    model_config = ConfigDict(from_attributes=True)

class DriverDataResponse(BaseModel):
    message: str
    driver_data: DriverResponse # Вкладаємо схему в схему!

# --- СХЕМИ ТРАНСПОРТУ ---
class TransportDimensions(BaseModel):
    length: float
    width: float
    height: float
    volume_m3: float | None = None

class TransportCreate(BaseModel):
    company_id: uuid.UUID
    weight_capacity: Decimal
    license_type: str
    model: str
    status: str
    dimensions: TransportDimensions
    mileage: int
    fuel_consumption_rate: Decimal
    next_maintenance_date: date
    # WKT : Longitude - Latitude
    lon: float = Field(ge=-180.0, le=180.0)
    lat: float = Field(ge=-90.0, le=90.0)

# --- СХЕМИ КОМПАНІЇ ---
class CompanyCreate(BaseModel):
    name: str
    manager_id: uuid.UUID
    registration_number: str
    address: str
    bank_details: str
    corporation_email: EmailStr
    domain: str = Field(pattern=r"^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")

# --- СХЕМИ КОРИСТУВАЧА ---
class UserRegistration(BaseModel):
    first_name: str
    last_name: str
    email: str | EmailStr
    password: str
    phone: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserLogout(BaseModel):
    user_id: uuid.UUID


# --- СХЕМА СКЛАДІВ ---
class WarehouseCreate(BaseModel):
    company_id: uuid.UUID
    manager_id: uuid.UUID
    total_capacity: Decimal
    available_capacity: Decimal
    type: str
    # WKT : Longitude - Latitude
    lon: float = Field(ge=-180.0, le=180.0)
    lat: float = Field(ge=-90.0, le=90.0)