from fastapi import FastAPI, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text  # Для виконання сирих SQL-запитів

from database.session import get_db
from auth.router import router as auth_router
from api.routers import directors, dispatchers, drivers, requests, warehouses

app = FastAPI(title="Hackaton API", version="1.0")

origins = [
    "http://localhost:3000",  # Якщо використовуєте Create React App
    "http://localhost:5173",  # Якщо використовуєте Vite
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # Дозволяємо ці адреси
    allow_credentials=True,     # Дозволяємо передачу кукі/токенів
    allow_methods=["*"],        # Дозволяємо всі методи (GET, POST, PUT, DELETE)
    allow_headers=["*"],        # Дозволяємо всі заголовки
)

app.include_router(auth_router)
app.include_router(directors.router)
app.include_router(dispatchers.router)
app.include_router(drivers.router)
app.include_router(requests.router)
app.include_router(warehouses.router)

@app.get("/api/status", status_code=status.HTTP_200_OK, tags=["Статус"])
def get_status():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/test-db")
def test_database_connection(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1")).scalar()
        if result == 1:
            return {"status": "success", "message": "Підключення до PostgreSQL успішне! 🚀"}
    except Exception as e:
        return {"status": "error", "message": f"Помилка підключення: {str(e)}"}