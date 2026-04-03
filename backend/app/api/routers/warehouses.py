from fastapi import APIRouter, status

router = APIRouter(
    prefix="/api/v1/warehouses",
    tags=["Warehouses"]
)

@router.get("/warehouses")
def get_warehouses():
    # Запит до ДБ щоб отримати список складів
    pass

@router.post("/warehouse", status_code=201)
def create_warehouse():
    """Створити новий склад"""
    pass

@router.get("/warehouses/{warehouse_id}")
def get_warehouse(warehouser_id: str):
    """Отримати дані конкретного складу за його ID"""
    pass

@router.patch("/warehouses/{warehouse_id}", status_code=201)
def update_warehouse(warehouse_id: str):
    """Оновити дані про склад"""
    pass

@router.delete("/warehouses/{warehouse_id}")
def delete_warehouse(warehouse_id: str):
    """Прибрати існуючий склад"""
    pass