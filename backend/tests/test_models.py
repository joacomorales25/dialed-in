import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models import Coffee, CoffeeCreate, Shot, ShotCreate, Recipe, RecipeCreate, Profile, Settings
from datetime import date


def test_coffee_serialises_to_camel_case():
    c = Coffee(id=1, name="Test", roaster="Lab", roast="light",
               roast_date=date(2026, 4, 1), origin=None,
               altitude=None, process=None, notes=None)
    d = c.model_dump(by_alias=True)
    assert "roastDate" in d
    assert "roast_date" not in d


def test_shot_yield_serialises_without_underscore():
    s = Shot(id=1, coffee_id=1, dose=18.0, yield_=36.0, time=27,
             grinder=12.0, rating=5, dialed_in=False,
             recipe_id=None, pressure=None, notes=None, date=None)
    d = s.model_dump(by_alias=True)
    assert "yield" in d
    assert "yield_" not in d


def test_shot_deserialises_yield_from_json():
    # Simulates what FastAPI receives from the frontend
    s = ShotCreate.model_validate({
        "coffeeId": 1, "dose": 18.0, "yield": 36.0,
        "time": 27, "grinder": 12.0, "rating": 5,
        "dialedIn": False
    })
    assert s.yield_ == 36.0
    assert s.coffee_id == 1


def test_recipe_has_created_at():
    r = Recipe(id=1, coffee_id=42, coffee_name="Ethiopia", roast="light", dose=18.0,
               yield_=36.0, time=27, grinder=12.0, author="Joaquín",
               likes=0, created_at=date(2026, 5, 1),
               roaster=None, notes=None)
    d = r.model_dump(by_alias=True)
    assert "createdAt" in d
    assert "coffeeId" in d


def test_settings_serialises_default_dose():
    s = Settings(id=1)
    d = s.model_dump(by_alias=True)
    assert "defaultDose" in d
    assert "default_dose" not in d
