from fastapi import FastAPI, status
from datetime import datetime

from auth.router import router as auth_router
from api.routers import directors, dispatchers, drivers, requests, warehouses

app = FastAPI(title="Hackaton API", version="1.0")
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