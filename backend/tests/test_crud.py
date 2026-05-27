import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
import sqlite3
from database import _init_schema
import crud


@pytest.fixture
def conn(tmp_path):
    c = sqlite3.connect(str(tmp_path / "t.db"))
    c.row_factory = sqlite3.Row
    _init_schema(c)
    yield c
    c.close()


# ── Coffees ────────────────────────────────────────────────

def test_get_all_coffees_empty(conn):
    assert crud.get_all_coffees(conn) == []


def test_create_coffee_returns_dict_with_id(conn):
    data = {"name": "Ethiopia", "roaster": "Onyx", "roast": "light",
            "origin": None, "altitude": None, "process": None,
            "roast_date": None, "notes": None}
    result = crud.create_coffee(conn, data)
    assert result["id"] == 1
    assert result["name"] == "Ethiopia"


def test_get_coffee_returns_row(conn):
    data = {"name": "Colombia", "roaster": "Intelli", "roast": "medium",
            "origin": None, "altitude": None, "process": None,
            "roast_date": None, "notes": None}
    crud.create_coffee(conn, data)
    result = crud.get_coffee(conn, 1)
    assert result["name"] == "Colombia"


def test_get_coffee_not_found_returns_none(conn):
    assert crud.get_coffee(conn, 999) is None


def test_delete_coffee_returns_true(conn):
    data = {"name": "X", "roaster": "Y", "roast": "dark",
            "origin": None, "altitude": None, "process": None,
            "roast_date": None, "notes": None}
    crud.create_coffee(conn, data)
    assert crud.delete_coffee(conn, 1) is True
    assert crud.get_coffee(conn, 1) is None


def test_delete_coffee_not_found_returns_false(conn):
    assert crud.delete_coffee(conn, 999) is False


# ── Shots ──────────────────────────────────────────────────

def _make_coffee(conn):
    return crud.create_coffee(conn, {
        "name": "X", "roaster": "Y", "roast": "light",
        "origin": None, "altitude": None, "process": None,
        "roast_date": None, "notes": None,
    })


def test_get_all_shots_empty(conn):
    assert crud.get_all_shots(conn) == []


def test_create_shot_returns_dict_with_id(conn):
    coffee = _make_coffee(conn)
    data = {"coffee_id": coffee["id"], "recipe_id": None, "dose": 18.0,
            "yield_": 36.0, "time": 27, "grinder": 12.0, "pressure": None,
            "notes": None, "rating": 5, "dialed_in": False, "date": "2026-05-01"}
    result = crud.create_shot(conn, data)
    assert result["id"] == 1
    assert result["yield"] == 36.0


def test_get_shot_returns_row(conn):
    coffee = _make_coffee(conn)
    data = {"coffee_id": coffee["id"], "recipe_id": None, "dose": 18.0,
            "yield_": 36.0, "time": 27, "grinder": 12.0, "pressure": None,
            "notes": None, "rating": 4, "dialed_in": False, "date": None}
    shot = crud.create_shot(conn, data)
    result = crud.get_shot(conn, shot["id"])
    assert result is not None
    assert result["id"] == shot["id"]
    assert result["yield"] == 36.0


def test_get_all_shots_filter_by_coffee_id(conn):
    c1 = _make_coffee(conn)
    c2 = crud.create_coffee(conn, {"name": "B", "roaster": "Z", "roast": "dark",
            "origin": None, "altitude": None, "process": None,
            "roast_date": None, "notes": None})
    base = {"recipe_id": None, "dose": 18.0, "yield_": 36.0, "time": 27,
            "grinder": 12.0, "pressure": None, "notes": None, "rating": 3,
            "dialed_in": False, "date": None}
    crud.create_shot(conn, {**base, "coffee_id": c1["id"]})
    crud.create_shot(conn, {**base, "coffee_id": c2["id"]})
    assert len(crud.get_all_shots(conn, coffee_id=c1["id"])) == 1


def test_delete_shot(conn):
    coffee = _make_coffee(conn)
    data = {"coffee_id": coffee["id"], "recipe_id": None, "dose": 18.0,
            "yield_": 36.0, "time": 27, "grinder": 12.0, "pressure": None,
            "notes": None, "rating": 4, "dialed_in": False, "date": None}
    crud.create_shot(conn, data)
    assert crud.delete_shot(conn, 1) is True
    assert crud.get_shot(conn, 1) is None


# ── Recipes ────────────────────────────────────────────────

def _make_recipe_data(conn):
    coffee = _make_coffee(conn)
    return {
        "coffee_id": coffee["id"],
        "coffee_name": coffee["name"],
        "roaster": coffee["roaster"],
        "roast": "light",
        "dose": 18.0, "yield_": 36.0, "time": 27, "grinder": 12.0,
        "notes": None, "author": "Joaquín", "likes": 0,
        "created_at": "2026-05-01",
    }


def test_create_recipe_returns_dict(conn):
    data = _make_recipe_data(conn)
    result = crud.create_recipe(conn, data)
    assert result["id"] == 1
    assert result["author"] == "Joaquín"
    assert result["yield"] == 36.0
    assert result["coffee_id"] is not None


def test_get_all_recipes_empty(conn):
    assert crud.get_all_recipes(conn) == []


def test_like_recipe_increments(conn):
    data = _make_recipe_data(conn)
    crud.create_recipe(conn, data)
    result = crud.like_recipe(conn, 1)
    assert result["likes"] == 1


def test_like_recipe_not_found_returns_none(conn):
    assert crud.like_recipe(conn, 999) is None


def test_delete_recipe(conn):
    data = _make_recipe_data(conn)
    crud.create_recipe(conn, data)
    assert crud.delete_recipe(conn, 1) is True


# ── Profile ────────────────────────────────────────────────

def test_get_profile_returns_seeded_row(conn):
    profile = crud.get_profile(conn)
    assert profile["id"] == 1


def test_update_profile(conn):
    result = crud.update_profile(conn, {
        "name": "Joaquín", "email": "j@test.com", "username": "jq",
        "bio": "Espresso nerd", "machine": "Gaggia Classic Pro",
        "grinder": "Eureka Mignon",
    })
    assert result["name"] == "Joaquín"


# ── Settings ───────────────────────────────────────────────

def test_get_settings_returns_seeded_row(conn):
    settings = crud.get_settings(conn)
    assert settings["id"] == 1
    assert settings["language"] == "English"


def test_update_settings(conn):
    result = crud.update_settings(conn, {
        "language": "Español", "units": "metric",
        "default_dose": 17.0, "default_yield": 34.0, "default_time": 28,
    })
    assert result["language"] == "Español"
    assert result["default_dose"] == 17.0
