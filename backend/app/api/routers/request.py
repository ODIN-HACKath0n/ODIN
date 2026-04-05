from fastapi import APIRouter
import routing_engine # Ваш скомпільований C++ модуль!

router = APIRouter(prefix="/routing", tags=["Routing"])

@router.post("/recalculate")
async def recalculate_route():
    # 1. Створюємо запит
    req = routing_engine.Request()
    req.id = 1
    req.priority = routing_engine.Priority.HIGH
    req.itemNeeded = "diesel"
    req.px = 49.8397
    req.py = 24.0297
    req.targetPx = 49.9000
    req.targetPy = 24.1000
    req.currentLoad = 500
    req.itemWeight = 200
    req.maxCapacity = 1000

    # 2. Створюємо склади (дані дістаємо з БД)
    wh1 = routing_engine.Warehouse()
    wh1.id = 101
    wh1.px = 49.8500
    wh1.py = 24.0400
    wh1.inventory = {"diesel": 1000, "water": 50} # C++ автоматично перетворить це на std::unordered_map!

    wh2 = routing_engine.Warehouse()
    wh2.id = 102
    wh2.px = 49.8200
    wh2.py = 24.0100
    wh2.inventory = {"diesel": 0}

    # Пакуємо в список (C++ перетворить на std::vector<std::shared_ptr<Warehouse>>)
    warehouses = [wh1, wh2]

    # 3. Запускаємо C++ алгоритм
    finder = routing_engine.ResourceFinder()
    result = finder.findBestPath(req, warehouses)

    if result.isFound:
        return {
            "status": "success",
            "optimal_warehouse_id": result.optimalWarehouse.id,
            "total_distance": result.totalDistance,
            "straight_distance": result.straightDistance
        }
    else:
        return {"status": "not_found", "message": "No suitable warehouse in range."}