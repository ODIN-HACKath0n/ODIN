from datetime import date, datetime

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
    FREE = "FREE"

class OrderStatus(enum.Enum):
    DRAFT = "DRAFT"  # Чернетка (клієнт заповнює дані)
    PENDING = "PENDING"  # Очікує підтвердження менеджером або оплати
    CONFIRMED = "CONFIRMED"  # Підтверджено (готове до пошуку машини)

    # --- Етап підбору виконавця ---
    SEARCHING = "SEARCHING"  # Пошук перевізника/водія
    ASSIGNED = "ASSIGNED"  # Водія та транспорт призначено

    # --- Етап виконання (Логістика) ---
    ON_WAY_TO_PICKUP = "ON_WAY_TO_PICKUP"  # Водій їде на точку завантаження
    PICKING_UP = "PICKING_UP"  # Процес завантаження вантажу
    IN_TRANSIT = "IN_TRANSIT"  # Вантаж у дорозі (найдовший етап)
    ARRIVED_AT_DELIVERY = "ARRIVED_AT_DELIVERY"  # Прибув на точку розвантаження
    UNLOADING = "UNLOADING"  # Процес вивантаження

    # --- Фінальні етапи ---
    DELIVERED = "DELIVERED"  # Вантаж доставлено (але документи ще не підписані)
    COMPLETED = "COMPLETED"  # Завершено (вантаж доставлено, документи в порядку, оплата отримана)

    # --- Проблемні етапи ---
    CANCELED = "CANCELED"  # Скасовано (клієнтом або логістом)
    RETURNED = "RETURNED"  # Повернення (якщо отримувач не прийняв вантаж)
    ON_HOLD = "ON_HOLD"  # Призупинено (наприклад, через проблеми на митниці чи ДТП)


class PaymentStatus(enum.Enum):
    PENDING = "PENDING"       # Очікує оплати (замовлення створено, рахунок виставлено)
    PROCESSING = "PROCESSING" # В обробці (користувач перейшов на сторінку банку або транзакція перевіряється)
    COMPLETED = "COMPLETED"   # Успішно (гроші успішно списані/надійшли)
    FAILED = "FAILED"         # Помилка (відхилено банком, недостатньо коштів, ліміт)
    CANCELED = "CANCELED"     # Скасовано (клієнт передумав і закрив сторінку оплати, або менеджер скасував)
    REFUNDED = "REFUNDED"     # Повернено (гроші були повернуті клієнту після успішної оплати)


class LocationCoords(BaseModel):
    """Схема для зручної передачі координат з фронтенду (Широта, Довгота)"""
    lat: float = Field(ge=-90.0, le=90.0)
    lon: float = Field(ge=-180.0, le=180.0)

# --- СХЕМИ МЕНЕДЖЕРІВ ---

class ManagerCreate(BaseModel):
    """Схема для створення нового менеджера (директором)"""
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone: str

class ManagerUpdate(BaseModel):
    """Схема для оновлення даних менеджера (всі поля необов'язкові)"""
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None

class ManagerResponse(BaseModel):
    """Схема для повернення даних менеджера з БД"""
    user_id: uuid.UUID
    company_id: uuid.UUID | None = None
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    role: Roles
    is_online: bool | None = None

    # Дозволяє Pydantic читати дані з об'єктів SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

class ManagerDataResponse(BaseModel):
    """Схема-обгортка для відповіді API (згідно з вашим стилем)"""
    message: str
    manager_data: ManagerResponse


# --- СХЕМИ КЛІЄНТІВ ---
class ClientCreate(BaseModel):
    company_id: uuid.UUID
    company_name: str
    contact_person: str
    phone: str
    email: str | EmailStr
    billing_address: str

class ClientResponse(BaseModel):
    client_id: uuid.UUID
    company_id: uuid.UUID
    company_name: str
    contact_person: str
    phone: str
    billing_address: str

    model_config = ConfigDict(from_attributes=True)

class ClientDataResponse(BaseModel):
    message: str
    order_data: ClientResponse

# --- СХЕМИ ЗАМОВЛЕНЬ ---
class OrderCreate(BaseModel):
    pickup_address: LocationCoords
    delivery_address: LocationCoords
    weight: Decimal
    volume: Decimal
    cargo_description: str
    quantity: int
    price: Decimal
    created_at: datetime
    deadline: datetime
    client: ClientCreate

class OrderResponse(BaseModel):
    pickup_address: LocationCoords
    delivery_address: LocationCoords
    weight: Decimal
    volume: Decimal
    cargo_description: str
    quantity: int
    price: Decimal
    created_at: datetime
    deadline: datetime
    client: ClientCreate

    model_config = ConfigDict(from_attributes=True)

class OrderDataResponse(BaseModel):
    message: str
    order_data: OrderResponse # Вкладаємо схему в схему!

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