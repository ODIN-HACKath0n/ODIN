from fastapi import APIRouter, status

router = APIRouter(
    prefix="/api/v1/drivers",
    tags=["Drivers"]
)

@router.get("/")
def get_drivers():
    """Отримати список всіх водіїв компанії"""
    pass

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_driver():
    """Створити нового водія"""
    pass

@router.get("/{driver_id}")
def get_driver_by_id(driver_id: str):
    """Отримати дані конкретного водія за його ID"""
    pass

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(driver_id: str):
    """Звільнити водія"""
    pass