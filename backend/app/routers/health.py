from fastapi import APIRouter
from fastapi.responses import JSONResponse
router = APIRouter(prefix="/health", tags=["Health"])
@router.get("/")
async def health_check():
    return JSONResponse(content={"status":"ok","service":"Bitel API"})
@router.get("/ping")
async def ping():
    return JSONResponse(content={"status":"ok","service":"Bitel Backend"})
