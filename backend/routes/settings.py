from fastapi import APIRouter
from models import Settings, SettingsUpdate

router = APIRouter()


@router.get("/", response_model=Settings)
def get_settings():
    pass


@router.put("/", response_model=Settings)
def update_settings(body: SettingsUpdate):
    pass
