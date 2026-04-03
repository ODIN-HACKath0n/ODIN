from fastapi import APIRouter, status

router = APIRouter(
    prefix="/api/v1/directors",
    tags=["Directors"]
)

@router.get("/")
def get_directors():
    """Отримати список всіх директорів компанії"""
    pass

@router.post("/", status_code=201)
def create_director():
    """Створити нового директора"""
    pass

@router.get("/{director_id}")
def get_director(director_id: str):
    """Отримати дані конкретного директора за його ID"""
    pass

@router.delete("/{director_id}")
def delete_director(director_id: str):
    """Звільнити диспетчера"""
    pass