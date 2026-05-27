from fastapi import APIRouter
from models import Profile, ProfileUpdate

router = APIRouter()


@router.get("/", response_model=Profile)
def get_profile():
    pass


@router.put("/", response_model=Profile)
def update_profile(body: ProfileUpdate):
    pass
