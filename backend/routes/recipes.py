from fastapi import APIRouter, HTTPException
from models import Recipe, RecipeCreate

router = APIRouter()


@router.get("/", response_model=list[Recipe])
def list_recipes():
    pass


@router.post("/", response_model=Recipe, status_code=201)
def create_recipe(body: RecipeCreate):
    pass


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: int):
    pass


@router.post("/{recipe_id}/like", response_model=Recipe)
def like_recipe(recipe_id: int):
    pass


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int):
    pass
