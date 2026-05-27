from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from database import get_db
from models import Recipe, RecipeCreate
import crud

router = APIRouter()


@router.get("/", response_model=list[Recipe])
def list_recipes(conn=Depends(get_db)):
    return crud.get_all_recipes(conn)


@router.post("/", response_model=Recipe, status_code=201)
def create_recipe(body: RecipeCreate, conn=Depends(get_db)):
    data = body.model_dump()
    data["author"] = crud.get_profile(conn)["name"]
    data["likes"] = 0
    data["created_at"] = date.today().isoformat()
    return crud.create_recipe(conn, data)


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: int, conn=Depends(get_db)):
    recipe = crud.get_recipe(conn, recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.post("/{recipe_id}/like", response_model=Recipe)
def like_recipe(recipe_id: int, conn=Depends(get_db)):
    recipe = crud.like_recipe(conn, recipe_id)
    if recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: int, conn=Depends(get_db)):
    if not crud.delete_recipe(conn, recipe_id):
        raise HTTPException(status_code=404, detail="Recipe not found")
