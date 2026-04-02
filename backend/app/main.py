from fastapi import FastAPI, status
from datetime import datetime

from auth.router import router as auth_router

app = FastAPI(title="Hackaton API", version="1.0")
app.include_router(auth_router)

@app.get("/api/status", status_code=status.HTTP_200_OK, tags=["Статус"])
def get_status():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }