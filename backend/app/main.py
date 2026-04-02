from fastapi import FastAPI, Depends, HTTPException, status
from datetime import datetime

app = FastAPI()

@app.get("/api/status", status_code=status.HTTP_200_OK)
def get_status():
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat()
    }