from fastapi import APIRouter, status

router = APIRouter(
    prefix="/api/v1/dispatchers",
    tags=["Dispatchers"]
)

@router.get("/")
def get_dispatchers():
    # Запит до ДБ щоб отримати список диспетчерів певної компанії
    pass

@router.post("/", status_code=201)
def create_dispatcher():
    """Створити нового директора"""
    pass

@router.get("/{dispatcher_id}")
def get_dispatchers(dispatcher_id: str):
    """Отримати дані конкретного диспетчера за його ID"""
    pass

@router.delete("/{dispatcher_id}")
def delete_dispatcher(dispatcher_id: str):
    """Звільнити диспетчера"""
    pass
