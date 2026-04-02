from fastapi import APIRouter

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)

@router.get("/")
def get_locations():
    # Тут буде запит до бази даних (через SQLAlchemy) для отримання точок
    return [
        {"id": 1, "name": "Склад", "lat": 49.83, "lon": 24.02, "stock": 100},
        {"id": 2, "name": "Точка А", "lat": 49.84, "lon": 24.03, "stock": 0}
    ]

@router.post("/")
def create_location(name: str, lat: float, lon: float, stock: int = 0):
    """
    Створює нову локацію (склад або точку доставки) та зберігає її в системі.

    :param name: Назва локації (наприклад, "Головний склад" або "Точка доставки №5").
    :param lat: Географічна широта (Latitude) для визначення позиції на карті.
    :param lon: Географічна довгота (Longitude) для визначення позиції на карті.
    :param stock: Початковий залишок товару/ресурсу на цій локації (за замовчуванням 0).
    :return: Словник (який FastAPI автоматично конвертує в JSON) із даними створеної локації та статусом операції.
    """

    # Створюємо об'єкт локації (у майбутньому тут буде запис у базу даних через SQLAlchemy)
    new_location = {
        "name": name,
        "lat": lat,
        "lon": lon,
        "stock": stock
    }

    # Повертаємо результат роботи ендпоінту
    return {
        "status": "success",
        "message": f"Локація '{name}' успішно створена!",
        "data": new_location
    }