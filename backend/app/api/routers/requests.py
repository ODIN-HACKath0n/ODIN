from fastapi import APIRouter, status

router = APIRouter(
    prefix="/api/v1/requests",
    tags=["Requests"]
)

@router.get("/")
def get_requests():
    # Запит до ДБ щоб отримати список замовлень
    pass

@router.post("/", status_code=201)
def create_request():
    """Створити замовлення"""
    pass

@router.get("/{request_id}")
def get_request(request_id: str):
    """Отримати дані конкретного замовлення"""
    pass

@router.patch("/{request_id}", status_code=201)
def update_request(request_id: str):
    """Змінити щось в замовленні, статус як приклад"""
    pass

@router.delete("/{request_id}")
def delete_request(request_id: str):
    """Видалити замовлення"""
    pass
