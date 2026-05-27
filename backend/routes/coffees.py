from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import Coffee, CoffeeCreate
import crud

router = APIRouter()


@router.get("/", response_model=list[Coffee])
def list_coffees(conn=Depends(get_db)):
    return crud.get_all_coffees(conn)


@router.post("/", response_model=Coffee, status_code=201)
def create_coffee(body: CoffeeCreate, conn=Depends(get_db)):
    return crud.create_coffee(conn, body.model_dump())


@router.get("/{coffee_id}", response_model=Coffee)
def get_coffee(coffee_id: int, conn=Depends(get_db)):
    coffee = crud.get_coffee(conn, coffee_id)
    if coffee is None:
        raise HTTPException(status_code=404, detail="Coffee not found")
    return coffee


@router.delete("/{coffee_id}", status_code=204)
def delete_coffee(coffee_id: int, conn=Depends(get_db)):
    if not crud.delete_coffee(conn, coffee_id):
        raise HTTPException(status_code=404, detail="Coffee not found")
