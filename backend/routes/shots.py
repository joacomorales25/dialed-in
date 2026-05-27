from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from database import get_db
from models import Shot, ShotCreate
import crud

router = APIRouter()


@router.get("/", response_model=list[Shot])
def list_shots(coffee_id: Optional[int] = Query(default=None), conn=Depends(get_db)):
    return crud.get_all_shots(conn, coffee_id=coffee_id)


@router.post("/", response_model=Shot, status_code=201)
def create_shot(body: ShotCreate, conn=Depends(get_db)):
    data = body.model_dump()
    return crud.create_shot(conn, data)


@router.get("/{shot_id}", response_model=Shot)
def get_shot(shot_id: int, conn=Depends(get_db)):
    shot = crud.get_shot(conn, shot_id)
    if shot is None:
        raise HTTPException(status_code=404, detail="Shot not found")
    return shot


@router.delete("/{shot_id}", status_code=204)
def delete_shot(shot_id: int, conn=Depends(get_db)):
    if not crud.delete_shot(conn, shot_id):
        raise HTTPException(status_code=404, detail="Shot not found")
