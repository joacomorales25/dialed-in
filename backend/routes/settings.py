from fastapi import APIRouter, Depends
from database import get_db
from models import Settings, SettingsUpdate
import crud

router = APIRouter()


@router.get("/", response_model=Settings)
def get_settings(conn=Depends(get_db)):
    return crud.get_settings(conn)


@router.put("/", response_model=Settings)
def update_settings(body: SettingsUpdate, conn=Depends(get_db)):
    return crud.update_settings(conn, body.model_dump())
