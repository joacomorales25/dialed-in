from fastapi import APIRouter, HTTPException
from models import Coffee, CoffeeCreate

router = APIRouter()


@router.get("/", response_model=list[Coffee])
def list_coffees():
    pass


@router.post("/", response_model=Coffee, status_code=201)
def create_coffee(body: CoffeeCreate):
    pass


@router.get("/{coffee_id}", response_model=Coffee)
def get_coffee(coffee_id: int):
    pass


@router.delete("/{coffee_id}", status_code=204)
def delete_coffee(coffee_id: int):
    pass
