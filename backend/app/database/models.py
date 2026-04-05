import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, ForeignKey, DateTime, SmallInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB, DATE, CITEXT
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from sqlalchemy import Enum as SQLEnum
from geoalchemy2 import Geography

from database.schemas import Roles, Status, PaymentStatus, OrderStatus

# Базовий клас, від якого "наслідуються" всі наші таблиці
Base = declarative_base()

# ==========================================
# Таблиця: Клієнт
# ==========================================
class Client(Base):
    __tablename__ = "clients"

    client_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id"))
    company_name = Column(Text, nullable=False)
    contact_person = Column(Text, nullable=False)
    phone = Column(String(50))
    email = Column(Text, nullable=False)
    billing_address = Column(Text, nullable=False)

    company = relationship("Company", backref="clients")

# ==========================================
# Таблиця: Компанія
# ==========================================
class Company(Base):
    __tablename__ = "companies"  # Так таблиця буде називатися в базі PostgreSQL

    company_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(Text, nullable=False)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    corporation_email = Column(Text)
    domain = Column(CITEXT)
    registration_number = Column(String(50))
    address = Column(Text)
    bank_details = Column(String(50))

    users = relationship(
        "User",
        back_populates="company",
        foreign_keys="[User.company_id]"
    )
    manager = relationship(
        "User",
        foreign_keys=[manager_id]
    )

# ==========================================
# Таблиця: Водії
# ==========================================
class Driver(Base):
    __tablename__ = "drivers"

    # Тут user_id є одночасно і Primary Key, і Foreign Key до таблиці Users
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), primary_key=True)
    assigned_transport_id = Column(UUID(as_uuid=True), ForeignKey("transports.transport_id"), nullable=True)
    dispatcher_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=True)

    license_type = Column(String(20))
    experience_years = Column(SmallInteger)  # smallint
    status = Column(String(50), default="Free")

    # Зв'язок назад до користувача
    user = relationship("User", back_populates="driver_profile", foreign_keys=[user_id])


# ==========================================
# Таблиця: Замовлення
# ==========================================
class Order(Base):
    __tablename__ = "orders"
    order_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id"))
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.client_id"))
    priority = Column(String(20))
    status = Column(SQLEnum(OrderStatus, native_enum=False, length=50), default=OrderStatus.CONFIRMED)
    cargo_description = Column(Text)
    weight = Column(Numeric(10,2))
    volume = Column(Numeric(10,2))
    quantity = Column(Integer)
    price = Column(Numeric(10,2))

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deadline = Column(DateTime(timezone=True))

    pickup_address = Column(Geography(geometry_type='POINT', srid=4326))
    delivery_address = Column(Geography(geometry_type='POINT', srid=4326))

    client = relationship("Client", backref="orders")
    company = relationship("Company", backref="orders")

# ==========================================
# Таблиця: Оплата
# ==========================================

class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.order_id"))
    status = Column(SQLEnum(PaymentStatus, native_enum=False, length=50), default=PaymentStatus.PENDING)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    payment_method = Column(String(50))
    amount = Column(Numeric(10,2))

# ==========================================
# Таблиця: Доставка
# ==========================================

class Shipment(Base):
    __tablename__ = "shipments"

    shipment_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.order_id"))
    transport_id = Column(UUID(as_uuid=True), ForeignKey("transports.transport_id"))
    driver_id = Column(UUID(as_uuid=True), ForeignKey("drivers.user_id"))
    dispatcher_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    quantity = Column(Numeric(10,2))
    status = Column(SQLEnum(Status, native_enum=False, length=50), default=Status.IDLE)
    departure_date = Column(DateTime(timezone=True), server_default=func.now())
    arrival_date = Column(DateTime(timezone=True), server_default=func.now())
    waybill_number = Column(String(100))

    order = relationship("Order", backref="shipments")
    transport = relationship("Transport", backref="shipments")
    driver = relationship("Driver", foreign_keys=[driver_id])
    dispatcher = relationship("User", foreign_keys=[dispatcher_id])

# ==========================================
# Таблиця: Телеметрія
# ==========================================

class Telemetry(Base):
    __tablename__ = "telemetry"

    record_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transport_id = Column(UUID(as_uuid=True), ForeignKey("transports.transport_id"))
    shipment_id = Column(UUID(as_uuid=True), ForeignKey("shipments.shipment_id"))
    latitude = Column(Numeric(9,6))
    longitude = Column(Numeric(9,6))
    speed = Column(SmallInteger)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

# ==========================================
# Таблиця: Транспорт
# ==========================================

class Transport(Base):
    __tablename__ = "transports"

    transport_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id"))
    weight_capacity = Column(Numeric(10,2))
    weight = Column(Numeric(10,2))
    license_plate = Column(String(20))
    model = Column(Text)
    dimensions = Column(JSONB)
    mileage = Column(Integer)
    fuel_consumption_rate = Column(Numeric(5,2))
    next_maintenance_date = Column(DATE)
    current_position = Column(Geography(geometry_type='POINT', srid=4326))
    status = Column(SQLEnum(Status, native_enum=False, length=50), default=Status.FREE)

# ==========================================
# Таблиця: Користувачі
# ==========================================
class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Створюємо Foreign Key, який посилається на таблицю companies
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id", ondelete="RESTRICT"))

    first_name = Column(Text)
    last_name = Column(Text)
    email = Column(Text, unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)
    phone = Column(String(20))
    role = Column(SQLEnum(Roles, native_enum=False, length=50), default=Roles.NONE)
    is_online = Column(Boolean, default=False)

    company = relationship(
        "Company",
        back_populates="users",
        foreign_keys=[company_id]
    )
    driver_profile = relationship(
        "Driver",
        back_populates="user",
        uselist=False,
        foreign_keys="[Driver.user_id]"
    )

# ==========================================
# Таблиця: Склади
# ==========================================

class Warehouse(Base):
    __tablename__ = "warehouses"

    warehouse_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id = Column(UUID(as_uuid=True), ForeignKey("companies.company_id"))
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))
    total_capacity = Column(Numeric(10,2))
    available_capacity = Column(Numeric(10,2))
    type = Column(String(50))
    address = Column(Geography(geometry_type='POINT', srid=4326))