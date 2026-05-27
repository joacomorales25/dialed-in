from fastapi import APIRouter, Depends
from database import get_db
from models import Profile, ProfileUpdate
import crud

router = APIRouter()


@router.get("/", response_model=Profile)
def get_profile(conn=Depends(get_db)):
    return crud.get_profile(conn)


@router.put("/", response_model=Profile)
def update_profile(body: ProfileUpdate, conn=Depends(get_db)):
    return crud.update_profile(conn, body.model_dump())
