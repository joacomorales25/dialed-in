from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from models import Shot, ShotCreate

router = APIRouter()


@router.get("/", response_model=list[Shot])
def list_shots(coffee_id: Optional[int] = Query(default=None)):
    pass


@router.post("/", response_model=Shot, status_code=201)
def create_shot(body: ShotCreate):
    pass


@router.get("/{shot_id}", response_model=Shot)
def get_shot(shot_id: int):
    pass


@router.delete("/{shot_id}", status_code=204)
def delete_shot(shot_id: int):
    pass
