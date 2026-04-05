ODIN — Logistics Management Platform

> Повноцінна платформа управління логістикою з власним C++ рушієм оптимізації маршрутів, побудована на FastAPI + React.
## Зміст

- [Про проєкт](#про-проєкт)
- [Технологічний стек](#технологічний-стек)
- [Архітектура системи](#архітектура-системи)
- [Структура проєкту](#структура-проєкту)
- [Швидкий старт](#швидкий-старт)
- [Автентифікація](#автентифікація)
- [API Ендпоінти](#api-ендпоінти)
- [Pydantic схеми (тіла запитів)](#pydantic-схеми-тіла-запитів)
- [Моделі бази даних](#моделі-бази-даних)
- [Enum-значення](#enum-значення)
- [Ролі користувачів та права доступу](#ролі-користувачів-та-права-доступу)
- [C++ Routing Engine](#c-routing-engine)
- [Frontend (greenroad-app)](#frontend-greenroad-app)
- [Помилки та коди відповідей](#помилки-та-коди-відповідей)

---

## Про проєкт

**ODIN** — це система управління логістичними операціями транспортної компанії. Платформа автоматизує повний цикл: від прийому замовлень і управління персоналом до оптимальної побудови маршрутів доставки з урахуванням складів, пріоритетів і вантажопідйомності.

Ключові можливості:
- Мультирольова система доступу (директор → менеджер → водій)
- Управління компаніями, співробітниками, клієнтами, замовленнями
- Реальні географічні координати (PostGIS) для складів, транспорту та замовлень
- Власний C++ рушій пошуку оптимального складу та маршруту (Haversine + пріоритетна черга)
- JWT-автентифікація з відстеженням онлайн-статусу
- React SPA з адмін-панеллю

---

## Технологічний стек

| Шар | Технологія | Версія |
|---|---|---|
| **Backend** | FastAPI | 0.135.3 |
| **Python** | Python | 3.12 |
| **Frontend** | React + Vite | 19 / 8 |
| **Роутинг (SPA)** | React Router DOM | 7.x |
| **База даних** | PostgreSQL + PostGIS | — |
| **ORM** | SQLAlchemy (async) | 2.0.49 |
| **Валідація** | Pydantic | 2.12.5 |
| **Міграції** | Alembic | — |
| **Routing Engine** | C++ + pybind11 | 3.0.3 |
| **Автентифікація** | JWT (PyJWT) | 2.12.1 |
| **Хешування паролів** | Werkzeug (pbkdf2:sha256) | 3.1.8 |
| **Геодані** | GeoAlchemy2 | 0.18.4 |
| **Контейнеризація** | Docker + Docker Compose | — |

---

## Архітектура системи

```
┌─────────────────────────────────────────────────────────┐
│                   React SPA (Frontend)                   │
│           Vite · React Router · Fetch API                │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP / REST (JSON)
┌───────────────────────▼─────────────────────────────────┐
│                  FastAPI (Backend)                      │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │   Auth   │  │  Routers │  │  C++ Routing Engine  │   │
│  │  (JWT)   │  │ (REST)   │  │  (pybind11 module)   │   │
│  └──────────┘  └────┬─────┘  └──────────────────────┘   │
│                     │                                   │
│  ┌──────────────────▼─────────────────────────────── ┐  │
│  │              CRUD Layer (SQLAlchemy)              │  │
│  └──────────────────────┬────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────┘
                           │ asyncpg
┌──────────────────────────▼──────────────────────────────┐
│            PostgreSQL + PostGIS (Database)              │
│    users · companies · drivers · orders · shipments     │
│    transports · warehouses · payments · telemetry       │
└─────────────────────────────────────────────────────────┘

## Структура проєкту
ODIN/
├── docker-compose.yml
│
├── backend/
│   ├── alembic.ini                    # Конфігурація міграцій
│   ├── requirements.txt               # Python залежності
│   ├── setup.py                       # Збірка C++ модуля
│   │
│   ├── alembic/
│   │   └── env.py                     # Налаштування Alembic
│   │
│   ├── cpp_engine/                    # Вихідний код C++ рушія
│   │   ├── CMakeLists.txt
│   │   ├── includes/
│   │   │   ├── Algorithm_Path.hpp     # Структури: Request, Warehouse, RouteResult
│   │   │   ├── Python_include.hpp
│   │   │   └── Storage_Manager.hpp
│   │   └── src/
│   │       ├── Algorithm_Path.cpp     # Haversine + пошук оптимального складу
│   │       ├── Python_include.cpp     # pybind11 bindings
│   │       ├── Storage_Manager.cpp
│   │       └── sqlite3.c
│   │
│   └── app/
│       ├── main.py                    # Точка входу FastAPI, CORS
│       │
│       ├── auth/
│       │   └── router.py              # /auth: login, register, logout
│       │
│       ├── api/
│       │   └── routers/
│       │       ├── clients.py         # /api/v1/clients
│       │       ├── companies.py       # /api/v1/companies
│       │       ├── directors.py       # /api/v1/directors
│       │       ├── drivers.py         # /api/v1/drivers
│       │       ├── managers.py        # /api/v1/managers
│       │       ├── orders.py          # /api/v1/orders
│       │       └── request.py         # /api/v1/routing
│       │
│       ├── crud/                      # Функції роботи з БД
│       │   ├── user.py
│       │   ├── client.py
│       │   ├── company.py
│       │   ├── director.py
│       │   ├── driver.py
│       │   ├── manager.py
│       │   ├── order.py
│       │   └── transport.py
│       │
│       ├── database/
│       │   ├── models.py              # SQLAlchemy ORM моделі
│       │   ├── schemas.py             # Pydantic схеми + Enum
│       │   └── session.py             # AsyncEngine, get_db()
│       │
│       └── core/
│           └── dependencies.py        # JWT: get_current_user, create_access_token
│
└── greenroad-app/                     # React SPA
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                    # Роутинг: /, /login, /register, /admin
        ├── main.jsx
        ├── context/
        │   └── AppContext.jsx         # Глобальний стан
        ├── api/
        │   ├── auth.js                # login, register, logout
        │   └── api.js                 # drivers, orders, clients, managers...
        ├── pages/
        │   ├── HomePage.jsx
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── ForgotPasswordPage.jsx
        │   └── AdminPage.jsx
        └── components/
            ├── Auth.jsx
            ├── Drivers.jsx
            ├── Directors.jsx
            ├── Managers.jsx
            ├── Orders.jsx
            ├── Clients.jsx
            └── Companies.jsx


## Швидкий старт

### Передумови

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- Python 3.12+ (для локального запуску)
- Node.js 18+ (для локального запуску)
- PostgreSQL з розширенням **PostGIS** (для локального запуску)
- C++ компілятор з підтримкою C++17 (для перекомпіляції routing engine)


### Запуск через Docker (рекомендовано)

bash
# 1. Клонуйте репозиторій
git clone https://github.com/ODIN-HACKath0n/ODIN.git
cd ODIN

# 2. Створіть .env файл
cp backend/.env.example backend/.env
# Відредагуйте backend/.env (дивіться розділ "Змінні середовища")

# 3. Запустіть усі сервіси одночасно
docker-compose up --build

Після запуску доступно:

| Сервіс                      | URL |
| Backend API                 | http://localhost:8000 |
| Swagger UI (документація)   | http://localhost:8000/docs |
| ReDoc                       | http://localhost:8000/redoc |
| Frontend                    | http://localhost:5173 |

### Локальний запуск без Docker

#### 1. Backend

bash
cd backend

# Встановіть Python залежності
pip install -r requirements.txt

# Застосуйте міграції бази даних
alembic upgrade head

# Запустіть сервер (з автоперезавантаженням)
cd app
uvicorn main:app --reload --host 0.0.0.0 --port 8000

#### 2. Frontend

bash
cd greenroad-app

# Встановіть залежності
npm install

# Запустіть dev-сервер
npm run dev

# Збірка для продакшну
npm run build


### Змінні середовища

Створіть файл `backend/.env` з наступними значеннями:

env
# Підключення до PostgreSQL (asyncpg драйвер)
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/odin_db

# Секретний ключ для підпису JWT токенів (змініть у продакшні!)
SECRET_KEY=your-very-secret-key-here

# Алгоритм підпису JWT
ALGORITHM=HS256

# Час дії токена (у хвилинах). За замовчуванням — 1 день (1440)
ACCESS_TOKEN_EXPIRE_MINUTES=1440

Для Frontend (опціонально) — файл `greenroad-app/.env`:

env
# URL бекенду (за замовчуванням http://localhost:8000)
VITE_API_URL=http://localhost:8000


### Збірка C++ Routing Engine (за потреби)

Якщо потрібно перекомпілювати модуль з вихідного коду:

bash
cd backend

# Встановіть залежності для збірки
pip install pybind11 setuptools

# Компіляція модуля
python setup.py build_ext --inplace

# Скопіюйте скомпільований файл в директорію app/
cp routing_engine*.so app/   # Linux/Mac
# або
cp routing_engine*.pyd app/  # Windows


Результат: файл `routing_engine.so` (Linux) або `routing_engine.pyd` (Windows), який імпортується в `app/api/routers/request.py`.

## Автентифікація

Система використовує **JWT Bearer Token** автентифікацію.

### Як отримати токен

bash
curl -X POST "http://localhost:8000/auth/login_user" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=yourpassword"

Відповідь:
json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "MANAGER"
}


### Як використовувати токен

Додайте заголовок до кожного захищеного запиту:

Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Як влаштований JWT

Токен містить:
- `sub` — UUID користувача
- `exp` — час закінчення дії (за замовчуванням 24 години)

Токен підписується `HS256` алгоритмом із `SECRET_KEY` із `.env`. Перевірка токена відбувається в `core/dependencies.py` через `get_current_user()` — FastAPI dependency, яка автоматично підключається до всіх захищених ендпоінтів.


## API Ендпоінти

Базовий URL: `http://localhost:8000`

### Автентифікація — `/auth`

Ці ендпоінти **не потребують** токена.

#### `POST /auth/register_user`
Реєстрація нового користувача в системі. Після реєстрації роль — `NONE`, компанія не прив'язана.

**Тіло запиту** (`application/json`):
json
{
  "first_name": "Іван",
  "last_name": "Петренко",
  "email": "ivan@example.com",
  "password": "securepassword123",
  "phone": "+380991234567"
}

**Відповідь** `201`:
json
{
  "message": "Create user in successfully",
  "user_data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "ivan@example.com",
    "first_name": "Іван",
    "last_name": "Петренко",
    "role": "NONE"
  }
}


`POST /auth/login_user`
Вхід в систему. Повертає JWT токен та роль користувача.

>  Запит надсилається як `application/x-www-form-urlencoded`, не JSON.

**Тіло запиту** (`application/x-www-form-urlencoded`):

username=ivan@example.com&password=securepassword123

**Відповідь** `200`:
json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "MANAGER"
}


#### `POST /auth/logout_user`
Вихід з системи. Встановлює `is_online = false` для користувача.

**Тіло запиту**:
json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000"
}


**Відповідь** `204`: (порожня)


### Компанії — `/api/v1/companies`

#### `POST /api/v1/companies/register_company`
Створення нової компанії. Тільки для `TECH_ADMIN`.

**Тіло запиту**:
json
{
  "name": "Логістик UA",
  "manager_id": "550e8400-e29b-41d4-a716-446655440001",
  "registration_number": "12345678",
  "address": "м. Київ, вул. Хрещатик, 1",
  "bank_details": "UA123456789012345678901234567",
  "corporation_email": "info@logistik-ua.com",
  "domain": "logistik-ua.com"
}


**Відповідь** `201`:
json
{
  "message": "Company created successfully",
  "company_data": {
    "company_id": "...",
    "company_name": "Логістик UA",
    "registration_number": "12345678"
  }
}


#### `POST /api/v1/companies/register_employee`
Прив'язати існуючого користувача до компанії. Тільки для `MANAGER` або `DIRECTOR` своєї компанії.

**Query параметри**:
- `company_id` (UUID) — ID компанії
- `user_email` (string) — Email користувача


POST /api/v1/companies/register_employee?company_id=...&user_email=ivan@example.com

#### `GET /api/v1/companies/employee`
Отримати співробітника компанії за email.

**Query параметри**:
- `company_id` (UUID)
- `email` (string)


###  Директори — `/api/v1/directors`

#### `GET /api/v1/directors/`
Список усіх директорів поточної компанії. Компанія визначається з JWT токена.

**Query параметри**:
- `skip` (int, за замовчуванням `0`) — зміщення для пагінації
- `limit` (int, за замовчуванням `100`) — кількість записів

**Відповідь** `200`:
json
{
  "directors": [
    {
      "user_id": "...",
      "first_name": "Олег",
      "last_name": "Директоренко",
      "email": "director@company.com",
      "role": "DIRECTOR"
    }
  ]
}


#### `GET /api/v1/directors/{director_id}`
Отримати дані конкретного директора своєї компанії.

**Path параметри**:
- `director_id` (UUID)


#### `POST /api/v1/directors/{user_id}`
Призначити існуючого користувача своєї компанії директором. Тільки для `DIRECTOR`.

**Path параметри**:
- `user_id` (UUID) — ID користувача, якого підвищують


#### `DELETE /api/v1/directors/{director_id}`
Зняти роль директора (роль змінюється на `NONE`). Тільки для `DIRECTOR`. Не можна зняти самого себе.


### 🧑‍💼 Менеджери — `/api/v1/managers`

#### `GET /api/v1/managers/`
Список усіх менеджерів компанії. Тільки для `DIRECTOR` або `MANAGER`.

**Query параметри**: `skip`, `limit`


#### `GET /api/v1/managers/{manager_id}`
Отримати дані менеджера за ID. Перевіряється належність до тієї ж компанії.

**Відповідь** `200`:
json
{
  "message": "Success",
  "manager_data": {
    "user_id": "...",
    "company_id": "...",
    "first_name": "Марія",
    "last_name": "Коваленко",
    "email": "manager@company.com",
    "phone": "+380501234567",
    "role": "MANAGER",
    "is_online": true
  }
}



#### `POST /api/v1/managers/`
Створити нового менеджера. Тільки для `DIRECTOR`. Менеджер автоматично прив'язується до компанії директора.

**Тіло запиту**:
json
{
  "first_name": "Марія",
  "last_name": "Коваленко",
  "email": "manager@company.com",
  "password": "password123",
  "phone": "+380501234567"
}



#### `PATCH /api/v1/managers/{manager_id}`
Оновити дані менеджера. `DIRECTOR` може оновлювати будь-якого, менеджер — лише себе.

**Тіло запиту** (всі поля необов'язкові):
json
{
  "first_name": "Марія",
  "last_name": "Коваленко",
  "phone": "+380501234567"
}


#### `DELETE /api/v1/managers/{manager_id}`
Видалити менеджера. Тільки для `DIRECTOR`.

**Відповідь** `204`: (порожня)


###  Водії — `/api/v1/drivers`

#### `GET /api/v1/drivers/`
Список усіх водіїв компанії з пагінацією.

**Відповідь** `200`:
json
{
  "message": "Success",
  "drivers": [
    {
      "user_id": "...",
      "assigned_transport_id": "...",
      "dispatcher_id": "...",
      "license_type": "CE",
      "experience_years": 5,
      "status": "Free"
    }
  ]
}


#### `GET /api/v1/drivers/{driver_id}`
Отримати дані конкретного водія разом з інформацією про пов'язаного користувача (`selectinload`).

**Відповідь** `200`:
```json
{
  "message": "Success",
  "driver_data": {
    "user_id": "...",
    "assigned_transport_id": null,
    "license_type": "B",
    "experience_years": 3,
    "status": "Free"
  }
}




#### `POST /api/v1/drivers/`
Найняти нового водія (створити запис Driver для існуючого User). Тільки для `MANAGER` або `DIRECTOR`.

**Тіло запиту**:
json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "dispatcher_id": "550e8400-e29b-41d4-a716-446655440001",
  "license_type": "CE",
  "experience_years": 7
}



#### `PATCH /api/v1/drivers/{driver_id}/transport`
Призначити транспорт водію. Тільки для `MANAGER`. Перевіряється належність водія до компанії менеджера.

**Query параметри**:
- `transport_id` (UUID) — ID транспортного засобу


PATCH /api/v1/drivers/{driver_id}/transport?transport_id=...



#### `DELETE /api/v1/drivers/{driver_id}`
Звільнити водія (видалити запис Driver, але не User). Тільки для `MANAGER` або `DIRECTOR`.

**Відповідь** `204`: (порожня)



###  Клієнти — `/api/v1/clients`

#### `GET /api/v1/clients/by_email`
Знайти клієнта компанії за email.

**Query параметри**:
- `client_email` (string)



#### `GET /api/v1/clients/by_id`
Знайти клієнта за UUID. Повертає тільки клієнтів своєї компанії.

**Query параметри**:
- `client_id` (UUID)



#### `GET /api/v1/clients/{client_id}`
Список клієнтів компанії з пагінацією.

**Query параметри**: `skip`, `limit`



#### `POST /api/v1/clients/create`
Створити нового клієнта. Тільки для `MANAGER` або `TECH_ADMIN`.

**Тіло запиту**:
json
{
  "company_id": "...",
  "company_name": "Клієнт ТОВ",
  "contact_person": "Степан Іваненко",
  "phone": "+380671234567",
  "email": "client@firm.com",
  "billing_address": "м. Львів, вул. Городоцька, 5"
}
```

---

###  Замовлення — `/api/v1/orders`

#### `GET /api/v1/orders/`
Список усіх замовлень компанії з пагінацією.

**Query параметри**: `skip`, `limit`



#### `GET /api/v1/orders/{order_id}`
Отримати деталі замовлення за ID. Разом завантажує пов'язані Company та Client (`selectinload`).

**Відповідь** `200`:
json
{
  "message": "Success",
  "order_data": {
    "pickup_address": { "lat": 49.8397, "lon": 24.0297 },
    "delivery_address": { "lat": 50.4501, "lon": 30.5234 },
    "weight": "1500.00",
    "volume": "8.50",
    "cargo_description": "Будівельні матеріали",
    "quantity": 10,
    "price": "25000.00",
    "created_at": "2025-01-15T10:00:00",
    "deadline": "2025-01-20T18:00:00"
  }
}




#### `POST /api/v1/orders/create`
Створити нове замовлення. Тільки для `MANAGER` або `TECH_ADMIN`. Якщо клієнт з вказаним email не існує — автоматично створюється. Замовлення отримує статус `CONFIRMED`.

**Тіло запиту**:
```json
{
  "pickup_address": { "lat": 49.8397, "lon": 24.0297 },
  "delivery_address": { "lat": 50.4501, "lon": 30.5234 },
  "weight": 1500.00,
  "volume": 8.50,
  "cargo_description": "Будівельні матеріали",
  "quantity": 10,
  "price": 25000.00,
  "created_at": "2025-01-15T10:00:00",
  "deadline": "2025-01-20T18:00:00",
  "client": {
    "company_id": "...",
    "company_name": "Клієнт ТОВ",
    "contact_person": "Степан Іваненко",
    "phone": "+380671234567",
    "email": "client@firm.com",
    "billing_address": "м. Львів, вул. Городоцька, 5"
  }
}
```

---

###  Маршрутизація — `/api/v1/routing`

#### `POST /api/v1/routing/recalculate`
Запускає C++ алгоритм для пошуку оптимального складу та маршруту. Поточна реалізація використовує хардкодовані тестові дані — у продакшні координати та склади мають братися з БД.

**Відповідь** `200` — якщо знайдено:
```json
{
  "status": "success",
  "optimal_warehouse_id": 101,
  "total_distance": 12.4,
  "straight_distance": 9.8
}
```

**Відповідь** `200` — якщо не знайдено:
```json
{
  "status": "not_found",
  "message": "No suitable warehouse in range."
}


###  Статус системи

#### `GET /api/status`
Перевірка доступності API. Не потребує автентифікації.

**Відповідь** `200`:
json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.123456"
}
```

---

## Pydantic схеми (тіла запитів)

### UserRegistration
```python
first_name: str
last_name: str
email: str | EmailStr
password: str
phone: str
```

### CompanyCreate
```python
name: str
manager_id: UUID
registration_number: str
address: str
bank_details: str
corporation_email: EmailStr
domain: str  # Валідація regex: ^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

### ManagerCreate
```python
first_name: str
last_name: str
email: EmailStr
password: str
phone: str
```

### ManagerUpdate (всі поля необов'язкові)
```python
first_name: str | None = None
last_name: str | None = None
phone: str | None = None
```

### DriverCreate
```python
user_id: UUID         # Існуючий User, якого роблять водієм
dispatcher_id: UUID   # Диспетчер, що керує водієм
license_type: str     # Наприклад "CE", "B", "D"
experience_years: int
```

### ClientCreate
```python
company_id: UUID
company_name: str
contact_person: str
phone: str
email: str | EmailStr
billing_address: str
```

### OrderCreate
```python
pickup_address: LocationCoords    # { lat: float, lon: float }
delivery_address: LocationCoords
weight: Decimal
volume: Decimal
cargo_description: str
quantity: int
price: Decimal
created_at: datetime
deadline: datetime
client: ClientCreate
```

### LocationCoords
```python
lat: float  # -90.0 <= lat <= 90.0
lon: float  # -180.0 <= lon <= 180.0
```

### TransportCreate
```python
company_id: UUID
weight_capacity: Decimal
license_type: str
model: str
status: str
dimensions: TransportDimensions  # { length, width, height, volume_m3? }
mileage: int
fuel_consumption_rate: Decimal
next_maintenance_date: date
lat: float
lon: float
```

### WarehouseCreate
```python
company_id: UUID
manager_id: UUID
total_capacity: Decimal
available_capacity: Decimal
type: str
lat: float  # Координати складу
lon: float
```

---

## Моделі бази даних

### `users`
| Колонка | Тип | Опис |
|---|---|---|
| `user_id` | UUID (PK) | Унікальний ідентифікатор |
| `company_id` | UUID (FK → companies) | Компанія (може бути NULL після реєстрації) |
| `first_name` | Text | Ім'я |
| `last_name` | Text | Прізвище |
| `email` | Text (UNIQUE, indexed) | Email — використовується як логін |
| `password` | Text | Хеш пароля (pbkdf2:sha256) |
| `phone` | String(20) | Телефон |
| `role` | Enum (Roles) | Роль у системі |
| `is_online` | Boolean | Статус онлайн (false за замовчуванням) |

### `companies`
| Колонка | Тип | Опис |
|---|---|---|
| `company_id` | UUID (PK) | Унікальний ідентифікатор |
| `company_name` | Text | Назва компанії |
| `manager_id` | UUID (FK → users) | Відповідальний менеджер |
| `corporation_email` | Text | Корпоративний email |
| `domain` | CITEXT | Домен компанії (регістронезалежний) |
| `registration_number` | String(50) | Реєстраційний номер |
| `address` | Text | Юридична адреса |
| `bank_details` | String(50) | Банківські реквізити |

### `drivers`
| Колонка | Тип | Опис |
|---|---|---|
| `user_id` | UUID (PK, FK → users CASCADE) | Посилання на User — є одночасно PK і FK |
| `assigned_transport_id` | UUID (FK → transports) | Призначений транспорт (nullable) |
| `dispatcher_id` | UUID (FK → users) | Диспетчер (nullable) |
| `license_type` | String(20) | Категорія водійських прав (B, C, CE тощо) |
| `experience_years` | SmallInteger | Стаж (роки) |
| `status` | String(50) | Статус (за замовчуванням "Free") |

### `orders`
| Колонка | Тип | Опис |
|---|---|---|
| `order_id` | UUID (PK) | Унікальний ідентифікатор |
| `company_id` | UUID (FK → companies) | Компанія-виконавець |
| `client_id` | UUID (FK → clients) | Замовник |
| `priority` | String(20) | Пріоритет доставки |
| `status` | Enum (OrderStatus) | Поточний статус замовлення |
| `cargo_description` | Text | Опис вантажу |
| `weight` | Numeric(10,2) | Вага (кг) |
| `volume` | Numeric(10,2) | Об'єм (м³) |
| `quantity` | Integer | Кількість одиниць |
| `price` | Numeric(10,2) | Вартість (грн) |
| `created_at` | DateTime (tz) | Дата і час створення |
| `deadline` | DateTime (tz) | Дедлайн доставки |
| `pickup_address` | Geography(POINT, SRID=4326) | Координати точки завантаження |
| `delivery_address` | Geography(POINT, SRID=4326) | Координати точки доставки |

### `transports`
| Колонка | Тип | Опис |
|---|---|---|
| `transport_id` | UUID (PK) | Унікальний ідентифікатор |
| `company_id` | UUID (FK → companies) | Компанія-власник |
| `weight_capacity` | Numeric(10,2) | Вантажопідйомність (кг) |
| `weight` | Numeric(10,2) | Власна вага транспорту (кг) |
| `license_plate` | String(20) | Державний номерний знак |
| `model` | Text | Модель автомобіля |
| `dimensions` | JSONB | Габарити `{"length": ..., "width": ..., "height": ...}` |
| `mileage` | Integer | Пробіг (км) |
| `fuel_consumption_rate` | Numeric(5,2) | Витрата палива (л/100км) |
| `next_maintenance_date` | DATE | Дата наступного технічного обслуговування |
| `current_position` | Geography(POINT, SRID=4326) | Поточне місцезнаходження |
| `status` | Enum (Status) | Поточний стан транспорту |

### `shipments`
| Колонка | Тип | Опис |
|---|---|---|
| `shipment_id` | UUID (PK) | Унікальний ідентифікатор |
| `order_id` | UUID (FK → orders) | Пов'язане замовлення |
| `transport_id` | UUID (FK → transports) | Транспортний засіб |
| `driver_id` | UUID (FK → drivers) | Водій |
| `dispatcher_id` | UUID (FK → users) | Диспетчер |
| `quantity` | Numeric(10,2) | Кількість вантажу |
| `status` | Enum (Status) | Статус доставки |
| `departure_date` | DateTime (tz) | Дата і час відправлення |
| `arrival_date` | DateTime (tz) | Дата і час прибуття |
| `waybill_number` | String(100) | Номер товарно-транспортної накладної |

### `clients`
| Колонка | Тип | Опис |
|---|---|---|
| `client_id` | UUID (PK) | Унікальний ідентифікатор |
| `company_id` | UUID (FK → companies) | Компанія-постачальник |
| `company_name` | Text | Назва компанії клієнта |
| `contact_person` | Text | Контактна особа |
| `phone` | String(50) | Телефон |
| `email` | Text | Email |
| `billing_address` | Text | Адреса для виставлення рахунків |

### `warehouses`
| Колонка | Тип | Опис |
|---|---|---|
| `warehouse_id` | UUID (PK) | Унікальний ідентифікатор |
| `company_id` | UUID (FK → companies) | Компанія-власник складу |
| `manager_id` | UUID (FK → users) | Відповідальний менеджер |
| `total_capacity` | Numeric(10,2) | Загальна місткість (м³ або кг) |
| `available_capacity` | Numeric(10,2) | Доступна місткість |
| `type` | String(50) | Тип складу (відкритий, закритий тощо) |
| `address` | Geography(POINT, SRID=4326) | Географічні координати складу |

### `payments`
| Колонка | Тип | Опис |
|---|---|---|
| `payment_id` | UUID (PK) | Унікальний ідентифікатор |
| `order_id` | UUID (FK → orders) | Пов'язане замовлення |
| `status` | Enum (PaymentStatus) | Статус платежу |
| `timestamp` | DateTime (tz) | Дата і час транзакції |
| `payment_method` | String(50) | Метод оплати (картка, рахунок тощо) |
| `amount` | Numeric(10,2) | Сума (грн) |

### `telemetry`
| Колонка | Тип | Опис |
|---|---|---|
| `record_id` | UUID (PK) | Унікальний ідентифікатор запису |
| `transport_id` | UUID (FK → transports) | Транспортний засіб |
| `shipment_id` | UUID (FK → shipments) | Пов'язана доставка |
| `latitude` | Numeric(9,6) | Широта |
| `longitude` | Numeric(9,6) | Довгота |
| `speed` | SmallInteger | Поточна швидкість (км/год) |
| `timestamp` | DateTime (tz) | Час фіксації телеметрії |

---

## Enum-значення

### Roles — ролі користувачів
| Значення | Опис |
|---|---|
| `NONE` | Без ролі (одразу після реєстрації до прив'язки до компанії) |
| `DIRECTOR` | Директор компанії — керує менеджерами |
| `MANAGER` | Менеджер — керує водіями, клієнтами, замовленнями |
| `DISPATCHER` | Диспетчер — керує маршрутами та доставками |
| `DRIVER` | Водій — виконує доставки |
| `TECH_ADMIN` | Технічний адміністратор — повний доступ |

### OrderStatus — статус замовлення
| Значення | Опис |
|---|---|
| `DRAFT` | Чернетка |
| `PENDING` | Очікує підтвердження або оплати |
| `CONFIRMED` | Підтверджено (початковий статус при створенні через API) |
| `SEARCHING` | Пошук водія або транспорту |
| `ASSIGNED` | Водія та транспорт призначено |
| `ON_WAY_TO_PICKUP` | Водій їде до точки завантаження |
| `PICKING_UP` | Процес завантаження вантажу |
| `IN_TRANSIT` | Вантаж у дорозі |
| `ARRIVED_AT_DELIVERY` | Прибув до точки розвантаження |
| `UNLOADING` | Процес розвантаження |
| `DELIVERED` | Доставлено (документи ще не підписані) |
| `COMPLETED` | Повністю завершено (документи підписані, оплата отримана) |
| `CANCELED` | Скасовано клієнтом або менеджером |
| `RETURNED` | Повернення вантажу (отримувач відмовився) |
| `ON_HOLD` | Призупинено (митниця, ДТП, форс-мажор) |

### Status — стан транспорту або доставки
| Значення | Опис |
|---|---|
| `ACTIVE` | Активний |
| `IDLE` | Простоює |
| `BUSY` | Зайнятий |
| `IN_TRANSIT` | В дорозі |
| `IS_UNLOADED` | Розвантажується |
| `FREE` | Вільний (за замовчуванням для нового транспорту) |

### PaymentStatus — статус оплати
| Значення | Опис |
|---|---|
| `PENDING` | Очікує оплати (рахунок виставлено) |
| `PROCESSING` | В обробці (транзакція ініційована) |
| `COMPLETED` | Успішно оплачено |
| `FAILED` | Помилка (відхилено банком, недостатньо коштів) |
| `CANCELED` | Скасовано до оплати |
| `REFUNDED` | Кошти повернено клієнту |

---

## Ролі користувачів та права доступу

| Операція | TECH_ADMIN | DIRECTOR | MANAGER | DISPATCHER | DRIVER |
|---|:---:|:---:|:---:|:---:|:---:|
| Створити компанію | 1 | 0 | 0 | 0 | 0 |
| Додати співробітника до компанії | 0| 1 | 1 | 0 | 0 |
| Призначити директора | 0 | 1 | 0 | 0 | 0 |
| Зняти директора | 0 | 1 | 0 | 0 | 0 |
| Переглядати список директорів | 1 | 1 | 1 | 1 | 1 |
| Створити менеджера  | 0 | 1 | 0 | 0 | 0 |
| Оновити менеджера | ❌ | ✅ | Тільки себе | ❌ | ❌ |
| Видалити менеджера | ❌ | ✅ | ❌ | ❌ | ❌ |
| Переглядати менеджерів | ❌ | ✅ | ✅ | ❌ | ❌ |
| Найняти водія | ❌ | ✅ | ✅ | ❌ | ❌ |
| Звільнити водія | ❌ | ✅ | ✅ | ❌ | ❌ |
| Призначити транспорт водію | ❌ | ❌ | ✅ | ❌ | ❌ |
| Переглядати водіїв | ✅ | ✅ | ✅ | ✅ | ✅ |
| Створити клієнта | ✅ | ❌ | ✅ | ❌ | ❌ |
| Переглядати клієнтів | ✅ | ✅ | ✅ | ✅ | ✅ |
| Створити замовлення | ✅ | ❌ | ✅ | ❌ | ❌ |
| Переглядати замовлення | ✅ | ✅ | ✅ | ✅ | ✅ |

> **Важливо:** Всі дані автоматично ізольовані між компаніями. Компанія поточного користувача визначається з JWT токена — неможливо отримати дані іншої компанії.



## C++ Routing Engine

Серцем системи оптимізації маршрутів є нативний C++ модуль, скомпільований через **pybind11** і доступний як Python пакет `routing_engine`.

### Принцип роботи

Алгоритм приймає запит (`Request`) з поточними координатами транспорту та координатами цільової точки доставки. Потім перебирає всі доступні склади (`Warehouse`) і знаходить оптимальний за такими критеріями:

1. **Наявність ресурсу** — склад має потрібний товар (`itemNeeded`) з ненульовим залишком
2. **Вантажопідйомність** — поточне завантаження + нова партія ≤ максимуму
3. **Допустиме відхилення** — маршрут `(поточна → склад → ціль)` ≤ `пряма відстань × коефіцієнт`
4. **Мінімальна відстань** — серед підходящих обирається склад з найкоротшим детуром
5. **Кращий запас** — при однаковій відстані переважає склад з більшим запасом ресурсу

### Коефіцієнт відхилення за пріоритетом

| Пріоритет | Коефіцієнт | Значення |
|---|---|---|
| `CRITICAL` | 1.05 | Дозволено відхилення лише 5% від прямого маршруту |
| `HIGH` | 1.15 | Дозволено відхилення 15% |
| `NORMAL` | 1.30 | Дозволено відхилення 30% |

### Формула відстані (Haversine)

Модуль використовує формулу **Haversine** для точного обчислення відстаней між географічними координатами по поверхні Землі (R = 6371 км):

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
distance = 2 × R × atan2(√a, √(1−a))
```

### Черга з пріоритетом (PriorityManager)

Окрім пошуку маршруту, модуль надає глобальну чергу запитів. Обробка відбувається у порядку: `CRITICAL > HIGH > NORMAL`. При однаковому пріоритеті — за часом надходження (FIFO через `timestamp`).

### Python API модуля

```python
import routing_engine

# Налаштування запиту
req = routing_engine.Request()
req.id = 1
req.priority = routing_engine.Priority.HIGH
req.itemNeeded = "diesel"       # Назва потрібного ресурсу
req.px = 49.8397                # Поточна широта (Львів)
req.py = 24.0297                # Поточна довгота
req.targetPx = 49.9000          # Ціль — широта
req.targetPy = 24.1000          # Ціль — довгота
req.currentLoad = 500           # Поточне завантаження (кг)
req.itemWeight = 200            # Вага потрібної партії (кг)
req.maxCapacity = 1000          # Макс. вантажопідйомність (кг)

# Опис складів (у продакшні береться з БД)
wh1 = routing_engine.Warehouse()
wh1.id = 101
wh1.px = 49.85
wh1.py = 24.04
wh1.inventory = {"diesel": 1000, "water": 50}

wh2 = routing_engine.Warehouse()
wh2.id = 102
wh2.px = 49.82
wh2.py = 24.01
wh2.inventory = {"diesel": 0}  # Немає дизелю — буде пропущено

# Запуск алгоритму
finder = routing_engine.ResourceFinder()
result = finder.findBestPath(req, [wh1, wh2])

if result.isFound:
    print(f"Оптимальний склад ID: {result.optimalWarehouse.id}")
    print(f"Маршрут через склад:   {result.totalDistance:.2f} км")
    print(f"Пряма відстань:         {result.straightDistance:.2f} км")
else:
    print("Підходящого складу не знайдено")
```

### Структури C++

```cpp
struct Request {
    unsigned int id;
    int64_t timestamp;        // Unix timestamp
    Priority priority;        // NORMAL=0, HIGH=1, CRITICAL=2
    std::string itemNeeded;   // Назва ресурсу
    double px, py;            // Поточні координати
    double targetPx, targetPy;// Координати цілі
    int currentLoad;          // Поточне завантаження (кг)
    float itemWeight;         // Вага партії (кг)
    int maxCapacity;          // Максимальна вантажопідйомність (кг)
};

struct Warehouse {
    int id;
    double px, py;            // Координати складу
    std::unordered_map<std::string, int> inventory; // ресурс → кількість
};

struct RouteResult {
    bool isFound;
    std::shared_ptr<Warehouse> optimalWarehouse;
    double totalDistance;     // Відстань через склад (км)
    double straightDistance;  // Пряма відстань до цілі (км)
};
```

---

## Frontend (greenroad-app)

React SPA з підтримкою темної/світлої теми.

### Сторінки

| Шлях | Компонент | Опис |
|---|---|---|
| `/` | `HomePage` | Головна сторінка з лендінгом |
| `/login` | `LoginPage` | Форма входу в систему |
| `/register` | `RegisterPage` | Форма реєстрації нового користувача |
| `/forgot-password` | `ForgotPasswordPage` | Відновлення доступу |
| `/admin` | `AdminPage` | Адмін-панель (захищена) |

### Компоненти адмін-панелі

| Компонент | Відповідає за |
|---|---|
| `Auth.jsx` | Логіка автентифікації |
| `Drivers.jsx` | Управління водіями |
| `Directors.jsx` | Управління директорами |
| `Managers.jsx` | Управління менеджерами |
| `Orders.jsx` | Управління замовленнями |
| `Clients.jsx` | Управління клієнтами |
| `Companies.jsx` | Управління компаніями |

### Глобальний стан

`AppContext` (`src/context/AppContext.jsx`) — React Context, що надає глобальний стан застосунку (токен, роль, дані користувача) всім компонентам без prop drilling.

### Автентифікація на фронтенді

Після успішного входу токен і роль зберігаються в `localStorage`:

```javascript
localStorage.setItem("token", data.access_token)
localStorage.setItem("role", data.role)
```

Всі захищені API-запити автоматично отримують токен через функцію-хелпер:

```javascript
const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
})
```

Після виходу обидва значення видаляються з `localStorage`.

### Змінна середовища

```env
VITE_API_URL=http://localhost:8000
```

Якщо не вказано — використовується `http://localhost:8000` за замовчуванням.

---

## Помилки та коди відповідей

| Код | Значення | Типова причина |
|---|---|---|
| `200` | OK | Успішний GET запит |
| `201` | Created | Ресурс успішно створено |
| `202` | Accepted | Ресурс успішно оновлено (PATCH) |
| `204` | No Content | Ресурс видалено (DELETE), порожня відповідь |
| `400` | Bad Request | Невірні вхідні дані або конфлікт (email вже існує) |
| `401` | Unauthorized | Відсутній, протермінований або невірний JWT токен |
| `403` | Forbidden | Недостатньо прав (невірна роль або чужа компанія) |
| `404` | Not Found | Запитаний ресурс не існує або не належить до вашої компанії |

**Приклад помилки авторизації `401`:**
```json
{
  "detail": "Could not validate credentials"
}
```

**Приклад помилки прав доступу `403`:**
```json
{
  "detail": "Only directors can promote others to directors"
}
```

**Приклад помилки відсутності ресурсу `404`:**
```json
{
  "detail": "Driver not found"
}
```

---

## Інтерактивна документація API

Після запуску backend автоматично доступна повна документація з можливістю тестувати ендпоінти прямо в браузері:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

