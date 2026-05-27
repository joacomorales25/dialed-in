# GaggiMate Backend Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement SQLite persistence for all 5 resources, wire all 17 FastAPI route handlers, and replace all frontend mock data with real fetch() calls via a central api.js module.

**Architecture:** Thin CRUD layer (`backend/crud.py`) holds all SQL; routes stay thin (validate → call crud → 404 if None). FastAPI `get_db` dependency injects a `sqlite3.Connection` per request and closes it after. Frontend calls are centralised in `frontend/src/api.js`; pages use `useEffect` + the api module, initialising state as empty arrays/objects (no mock data).

**Tech Stack:** Python 3.9.6, FastAPI 0.115, Pydantic v2.9.2, sqlite3 (raw, no ORM), pytest 8, httpx; React 18, Vite, Tailwind CSS.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `backend/requirements.txt` | Add pytest, httpx |
| Create | `backend/.gitignore` | Ignore gaggimate.db, __pycache__, .pytest_cache |
| Modify | `backend/database.py` | `get_connection()`, `get_db()`, `_init_schema()`, `create_tables()` |
| Modify | `backend/models.py` | camelCase `ConfigDict`, `yield_` alias, `created_at` on Recipe |
| Create | `backend/crud.py` | All DB operations — one function per operation |
| Modify | `backend/routes/coffees.py` | 4 handlers using `Depends(get_db)` + crud |
| Modify | `backend/routes/shots.py` | 4 handlers |
| Modify | `backend/routes/recipes.py` | 5 handlers |
| Modify | `backend/routes/profile.py` | 2 handlers |
| Modify | `backend/routes/settings.py` | 2 handlers |
| Create | `backend/tests/__init__.py` | Empty |
| Create | `backend/tests/conftest.py` | `db_conn` fixture + `client` fixture with dep override |
| Create | `backend/tests/test_database.py` | Schema + seed tests |
| Create | `backend/tests/test_models.py` | camelCase serialisation + yield alias tests |
| Create | `backend/tests/test_crud.py` | Unit tests for every crud function |
| Create | `backend/tests/test_routes.py` | Integration tests for every route |
| Create | `frontend/src/api.js` | All fetch() calls — one export per operation |
| Modify | `frontend/src/pages/CoffeesPage.jsx` | Replace mocks with api.js + useEffect |
| Modify | `frontend/src/pages/ShotsPage.jsx` | Replace mocks with api.js + useEffect |
| Modify | `frontend/src/pages/RecipesPage.jsx` | Replace mocks with api.js + useEffect |
| Modify | `frontend/src/pages/ProfilePage.jsx` | Replace mocks with api.js + useEffect |
| Modify | `frontend/src/pages/SettingsPage.jsx` | Replace mocks with api.js + useEffect |

---

## Task 1: Dev tooling — pytest, httpx, .gitignore

**Files:**
- Modify: `backend/requirements.txt`
- Create: `backend/.gitignore`

- [ ] **Step 1: Add pytest and httpx to requirements**

Replace `backend/requirements.txt` with:
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic==2.9.2
pytest==8.3.5
httpx==0.27.2
```

- [ ] **Step 2: Install new deps**

```bash
cd backend && pip3 install pytest==8.3.5 httpx==0.27.2
```

Expected: `Successfully installed pytest-8.3.5 httpx-0.27.2` (or "already satisfied").

- [ ] **Step 3: Create backend/.gitignore**

```
gaggimate.db
__pycache__/
.pytest_cache/
*.pyc
```

- [ ] **Step 4: Create tests package**

```bash
mkdir -p backend/tests && touch backend/tests/__init__.py
```

- [ ] **Step 5: Verify pytest discovers no tests yet**

```bash
cd backend && python3 -m pytest tests/ -v
```

Expected: `no tests ran` (exit 0 or exit 5 — both fine).

---

## Task 2: database.py — connection, schema, seed

**Files:**
- Modify: `backend/database.py`
- Create: `backend/tests/test_database.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_database.py`:
```python
import sqlite3
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import _init_schema, get_connection


def make_conn(tmp_path):
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    conn.row_factory = sqlite3.Row
    return conn


def test_get_connection_returns_connection(tmp_path, monkeypatch):
    monkeypatch.setenv("GAGGIMATE_DB", str(tmp_path / "test.db"))
    import database
    monkeypatch.setattr(database, "DB_PATH", str(tmp_path / "test.db"))
    conn = get_connection()
    assert isinstance(conn, sqlite3.Connection)
    conn.close()


def test_init_schema_creates_all_tables(tmp_path):
    conn = make_conn(tmp_path)
    _init_schema(conn)
    tables = {r[0] for r in conn.execute(
        "SELECT name FROM sqlite_master WHERE type='table'"
    ).fetchall()}
    assert {"coffees", "shots", "recipes", "profile", "settings"} <= tables
    conn.close()


def test_init_schema_seeds_profile_singleton(tmp_path):
    conn = make_conn(tmp_path)
    _init_schema(conn)
    row = conn.execute("SELECT id FROM profile WHERE id = 1").fetchone()
    assert row is not None
    conn.close()


def test_init_schema_seeds_settings_singleton(tmp_path):
    conn = make_conn(tmp_path)
    _init_schema(conn)
    row = conn.execute("SELECT id FROM settings WHERE id = 1").fetchone()
    assert row is not None
    conn.close()


def test_init_schema_idempotent(tmp_path):
    conn = make_conn(tmp_path)
    _init_schema(conn)
    _init_schema(conn)  # second call must not raise
    conn.close()
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd backend && python3 -m pytest tests/test_database.py -v
```

Expected: `ImportError: cannot import name '_init_schema' from 'database'`

- [ ] **Step 3: Implement database.py**

Replace `backend/database.py` entirely:
```python
import os
import sqlite3
from typing import Generator

DB_PATH: str = os.path.join(os.path.dirname(__file__), "gaggimate.db")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS coffees (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    roaster    TEXT    NOT NULL,
    origin     TEXT,
    altitude   TEXT,
    process    TEXT,
    roast      TEXT    NOT NULL,
    roast_date TEXT,
    notes      TEXT
);

CREATE TABLE IF NOT EXISTS shots (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    coffee_id  INTEGER NOT NULL REFERENCES coffees(id),
    recipe_id  INTEGER REFERENCES recipes(id),
    dose       REAL    NOT NULL,
    yield      REAL    NOT NULL,
    time       INTEGER NOT NULL,
    grinder    REAL    NOT NULL,
    pressure   REAL,
    notes      TEXT,
    rating     INTEGER NOT NULL,
    dialed_in  INTEGER NOT NULL DEFAULT 0,
    date       TEXT
);

CREATE TABLE IF NOT EXISTS recipes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    coffee_name TEXT    NOT NULL,
    roaster     TEXT,
    roast       TEXT    NOT NULL,
    dose        REAL    NOT NULL,
    yield       REAL    NOT NULL,
    time        INTEGER NOT NULL,
    grinder     REAL    NOT NULL,
    notes       TEXT,
    author      TEXT    NOT NULL,
    likes       INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS profile (
    id       INTEGER PRIMARY KEY,
    name     TEXT    NOT NULL DEFAULT 'User',
    email    TEXT    NOT NULL DEFAULT '',
    username TEXT    NOT NULL DEFAULT 'user',
    bio      TEXT,
    machine  TEXT,
    grinder  TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    id            INTEGER PRIMARY KEY,
    language      TEXT    NOT NULL DEFAULT 'English',
    units         TEXT    NOT NULL DEFAULT 'metric',
    default_dose  REAL    NOT NULL DEFAULT 18,
    default_yield REAL    NOT NULL DEFAULT 36,
    default_time  INTEGER NOT NULL DEFAULT 27
);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_db() -> Generator[sqlite3.Connection, None, None]:
    """FastAPI dependency — yields a connection, closes it after the request."""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def _init_schema(conn: sqlite3.Connection) -> None:
    """Create tables and seed singletons. Accepts a connection for testability."""
    conn.executescript(_SCHEMA)
    conn.execute("INSERT OR IGNORE INTO profile  (id) VALUES (1)")
    conn.execute("INSERT OR IGNORE INTO settings (id) VALUES (1)")
    conn.commit()


def create_tables() -> None:
    """Called at app startup — opens the real DB and runs _init_schema."""
    conn = get_connection()
    try:
        _init_schema(conn)
    finally:
        conn.close()
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd backend && python3 -m pytest tests/test_database.py -v
```

Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
cd backend && git add requirements.txt .gitignore tests/__init__.py tests/test_database.py database.py
git commit -m "feat: implement database.py with schema, seed, and get_db dependency"
```

*(No git repo yet — skip commit step if the project is not yet under version control.)*

---

## Task 3: models.py — camelCase config + yield alias + created_at

**Files:**
- Modify: `backend/models.py`
- Create: `backend/tests/test_models.py`

- [ ] **Step 1: Write failing tests**

Create `backend/tests/test_models.py`:
```python
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
    r = Recipe(id=1, coffee_name="Ethiopia", roast="light", dose=18.0,
               yield_=36.0, time=27, grinder=12.0, author="Joaquín",
               likes=0, created_at=date(2026, 5, 1),
               roaster=None, notes=None)
    d = r.model_dump(by_alias=True)
    assert "createdAt" in d


def test_settings_serialises_default_dose():
    s = Settings(id=1)
    d = s.model_dump(by_alias=True)
    assert "defaultDose" in d
    assert "default_dose" not in d
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd backend && python3 -m pytest tests/test_models.py -v
```

Expected: failures on camelCase assertions.

- [ ] **Step 3: Update models.py**

Replace `backend/models.py` entirely:
```python
from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Optional
from datetime import date

_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


# ── Coffees ────────────────────────────────────────────────

class CoffeeBase(BaseModel):
    model_config = _config
    name:       str
    roaster:    str
    origin:     Optional[str]  = None
    altitude:   Optional[str]  = None
    process:    Optional[str]  = None
    roast:      str
    roast_date: Optional[date] = None
    notes:      Optional[str]  = None

class CoffeeCreate(CoffeeBase):
    pass

class Coffee(CoffeeBase):
    id: int


# ── Shots ──────────────────────────────────────────────────

class ShotBase(BaseModel):
    model_config = _config
    coffee_id: int
    recipe_id: Optional[int]   = None
    dose:      float
    yield_:    float            = Field(alias="yield")
    time:      int
    grinder:   float
    pressure:  Optional[float] = None
    notes:     Optional[str]   = None
    rating:    int
    dialed_in: bool             = False
    date:      Optional[date]  = None

class ShotCreate(ShotBase):
    pass

class Shot(ShotBase):
    id: int


# ── Recipes ────────────────────────────────────────────────

class RecipeBase(BaseModel):
    model_config = _config
    coffee_name: str
    roaster:     Optional[str] = None
    roast:       str
    dose:        float
    yield_:      float          = Field(alias="yield")
    time:        int
    grinder:     float
    notes:       Optional[str] = None
    created_at:  Optional[date] = None

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id:     int
    author: str
    likes:  int = 0


# ── Profile ────────────────────────────────────────────────

class ProfileBase(BaseModel):
    model_config = _config
    name:     str
    email:    str
    username: str
    bio:      Optional[str] = None
    machine:  Optional[str] = None
    grinder:  Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int


# ── Settings ───────────────────────────────────────────────

class SettingsBase(BaseModel):
    model_config = _config
    language:      str   = "English"
    units:         str   = "metric"
    default_dose:  float = 18
    default_yield: float = 36
    default_time:  int   = 27

class SettingsUpdate(SettingsBase):
    pass

class Settings(SettingsBase):
    id: int
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd backend && python3 -m pytest tests/test_models.py -v
```

Expected: `5 passed`

---

## Task 4: crud.py — coffees + shots

**Files:**
- Create: `backend/crud.py`
- Create: `backend/tests/test_crud.py`

- [ ] **Step 1: Create conftest.py** (needed before tests can run)

Create `backend/tests/conftest.py`:
```python
import os
import sys
import sqlite3
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import _init_schema, get_db
from main import app
from fastapi.testclient import TestClient


@pytest.fixture
def db_conn(tmp_path):
    """Isolated SQLite connection with full schema applied."""
    conn = sqlite3.connect(str(tmp_path / "test.db"))
    conn.row_factory = sqlite3.Row
    _init_schema(conn)
    yield conn
    conn.close()


@pytest.fixture
def client(db_conn):
    """TestClient with get_db overridden to use the test connection."""
    app.dependency_overrides[get_db] = lambda: db_conn
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

- [ ] **Step 2: Write failing crud tests for coffees + shots**

Create `backend/tests/test_crud.py`:
```python
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
```

- [ ] **Step 3: Run tests — expect FAIL (crud module missing)**

```bash
cd backend && python3 -m pytest tests/test_crud.py -v
```

Expected: `ModuleNotFoundError: No module named 'crud'`

- [ ] **Step 4: Create crud.py with coffees + shots**

Create `backend/crud.py`:
```python
import sqlite3
from typing import Optional


def _row(row) -> dict:
    return dict(row)


# ── Coffees ────────────────────────────────────────────────

def get_all_coffees(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute("SELECT * FROM coffees ORDER BY id DESC").fetchall()
    return [_row(r) for r in rows]


def create_coffee(conn: sqlite3.Connection, data: dict) -> dict:
    cur = conn.execute(
        """INSERT INTO coffees
           (name, roaster, origin, altitude, process, roast, roast_date, notes)
           VALUES (:name, :roaster, :origin, :altitude, :process, :roast, :roast_date, :notes)""",
        data,
    )
    conn.commit()
    return _row(conn.execute("SELECT * FROM coffees WHERE id = ?", (cur.lastrowid,)).fetchone())


def get_coffee(conn: sqlite3.Connection, coffee_id: int) -> Optional[dict]:
    row = conn.execute("SELECT * FROM coffees WHERE id = ?", (coffee_id,)).fetchone()
    return _row(row) if row else None


def delete_coffee(conn: sqlite3.Connection, coffee_id: int) -> bool:
    cur = conn.execute("DELETE FROM coffees WHERE id = ?", (coffee_id,))
    conn.commit()
    return cur.rowcount > 0


# ── Shots ──────────────────────────────────────────────────

def get_all_shots(conn: sqlite3.Connection, coffee_id: Optional[int] = None) -> list[dict]:
    if coffee_id is not None:
        rows = conn.execute(
            "SELECT * FROM shots WHERE coffee_id = ? ORDER BY id DESC", (coffee_id,)
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM shots ORDER BY id DESC").fetchall()
    return [_row(r) for r in rows]


def create_shot(conn: sqlite3.Connection, data: dict) -> dict:
    cur = conn.execute(
        """INSERT INTO shots
           (coffee_id, recipe_id, dose, yield, time, grinder, pressure, notes, rating, dialed_in, date)
           VALUES (:coffee_id, :recipe_id, :dose, :yield_, :time, :grinder, :pressure, :notes, :rating, :dialed_in, :date)""",
        data,
    )
    conn.commit()
    return _row(conn.execute("SELECT * FROM shots WHERE id = ?", (cur.lastrowid,)).fetchone())


def get_shot(conn: sqlite3.Connection, shot_id: int) -> Optional[dict]:
    row = conn.execute("SELECT * FROM shots WHERE id = ?", (shot_id,)).fetchone()
    return _row(row) if row else None


def delete_shot(conn: sqlite3.Connection, shot_id: int) -> bool:
    cur = conn.execute("DELETE FROM shots WHERE id = ?", (shot_id,))
    conn.commit()
    return cur.rowcount > 0
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd backend && python3 -m pytest tests/test_crud.py -v -k "coffee or shot"
```

Expected: `10 passed`

---

## Task 5: crud.py — recipes, profile, settings

**Files:**
- Modify: `backend/crud.py` (append)
- Modify: `backend/tests/test_crud.py` (append)

- [ ] **Step 1: Append recipe + profile + settings tests to test_crud.py**

Append to the bottom of `backend/tests/test_crud.py`:
```python
# ── Recipes ────────────────────────────────────────────────

def test_create_recipe_returns_dict(conn):
    data = {"coffee_name": "Ethiopia", "roaster": "Onyx", "roast": "light",
            "dose": 18.0, "yield_": 36.0, "time": 27, "grinder": 12.0,
            "notes": None, "author": "Joaquín", "likes": 0,
            "created_at": "2026-05-01"}
    result = crud.create_recipe(conn, data)
    assert result["id"] == 1
    assert result["author"] == "Joaquín"


def test_get_all_recipes_empty(conn):
    assert crud.get_all_recipes(conn) == []


def test_like_recipe_increments(conn):
    data = {"coffee_name": "X", "roaster": None, "roast": "dark",
            "dose": 18.0, "yield_": 36.0, "time": 27, "grinder": 11.0,
            "notes": None, "author": "User", "likes": 0,
            "created_at": "2026-05-01"}
    crud.create_recipe(conn, data)
    result = crud.like_recipe(conn, 1)
    assert result["likes"] == 1


def test_like_recipe_not_found_returns_none(conn):
    assert crud.like_recipe(conn, 999) is None


def test_delete_recipe(conn):
    data = {"coffee_name": "Y", "roaster": None, "roast": "light",
            "dose": 18.0, "yield_": 36.0, "time": 28, "grinder": 12.0,
            "notes": None, "author": "User", "likes": 0,
            "created_at": "2026-05-01"}
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
```

- [ ] **Step 2: Run — expect FAIL (functions missing)**

```bash
cd backend && python3 -m pytest tests/test_crud.py -v -k "recipe or profile or settings"
```

Expected: `AttributeError: module 'crud' has no attribute 'create_recipe'`

- [ ] **Step 3: Append to crud.py**

Append to the bottom of `backend/crud.py`:
```python
# ── Recipes ────────────────────────────────────────────────

def get_all_recipes(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute("SELECT * FROM recipes ORDER BY likes DESC, id DESC").fetchall()
    return [_row(r) for r in rows]


def create_recipe(conn: sqlite3.Connection, data: dict) -> dict:
    cur = conn.execute(
        """INSERT INTO recipes
           (coffee_name, roaster, roast, dose, yield, time, grinder, notes, author, likes, created_at)
           VALUES (:coffee_name, :roaster, :roast, :dose, :yield_, :time, :grinder, :notes, :author, :likes, :created_at)""",
        data,
    )
    conn.commit()
    return _row(conn.execute("SELECT * FROM recipes WHERE id = ?", (cur.lastrowid,)).fetchone())


def get_recipe(conn: sqlite3.Connection, recipe_id: int) -> Optional[dict]:
    row = conn.execute("SELECT * FROM recipes WHERE id = ?", (recipe_id,)).fetchone()
    return _row(row) if row else None


def like_recipe(conn: sqlite3.Connection, recipe_id: int) -> Optional[dict]:
    cur = conn.execute(
        "UPDATE recipes SET likes = likes + 1 WHERE id = ?", (recipe_id,)
    )
    conn.commit()
    if cur.rowcount == 0:
        return None
    return get_recipe(conn, recipe_id)


def delete_recipe(conn: sqlite3.Connection, recipe_id: int) -> bool:
    cur = conn.execute("DELETE FROM recipes WHERE id = ?", (recipe_id,))
    conn.commit()
    return cur.rowcount > 0


# ── Profile ────────────────────────────────────────────────

def get_profile(conn: sqlite3.Connection) -> dict:
    return _row(conn.execute("SELECT * FROM profile WHERE id = 1").fetchone())


def update_profile(conn: sqlite3.Connection, data: dict) -> dict:
    conn.execute(
        """UPDATE profile
           SET name=:name, email=:email, username=:username,
               bio=:bio, machine=:machine, grinder=:grinder
           WHERE id = 1""",
        data,
    )
    conn.commit()
    return get_profile(conn)


# ── Settings ───────────────────────────────────────────────

def get_settings(conn: sqlite3.Connection) -> dict:
    return _row(conn.execute("SELECT * FROM settings WHERE id = 1").fetchone())


def update_settings(conn: sqlite3.Connection, data: dict) -> dict:
    conn.execute(
        """UPDATE settings
           SET language=:language, units=:units,
               default_dose=:default_dose, default_yield=:default_yield,
               default_time=:default_time
           WHERE id = 1""",
        data,
    )
    conn.commit()
    return get_settings(conn)
```

- [ ] **Step 4: Run all crud tests — expect PASS**

```bash
cd backend && python3 -m pytest tests/test_crud.py -v
```

Expected: `20 passed`

---

## Task 6: Wire route handlers

**Files:**
- Modify: `backend/routes/coffees.py`
- Modify: `backend/routes/shots.py`
- Modify: `backend/routes/recipes.py`
- Modify: `backend/routes/profile.py`
- Modify: `backend/routes/settings.py`
- Create: `backend/tests/test_routes.py`

- [ ] **Step 1: Write failing route integration tests**

Create `backend/tests/test_routes.py`:
```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ── Coffees ────────────────────────────────────────────────

def test_list_coffees_empty(client):
    r = client.get("/api/coffees/")
    assert r.status_code == 200
    assert r.json() == []


def test_create_and_get_coffee(client):
    payload = {"name": "Ethiopia", "roaster": "Onyx", "roast": "light"}
    r = client.post("/api/coffees/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Ethiopia"
    assert "id" in data
    assert "roastDate" in data   # camelCase alias

    r2 = client.get(f"/api/coffees/{data['id']}")
    assert r2.status_code == 200
    assert r2.json()["name"] == "Ethiopia"


def test_get_coffee_not_found(client):
    r = client.get("/api/coffees/999")
    assert r.status_code == 404


def test_delete_coffee(client):
    payload = {"name": "Colombia", "roaster": "Intelli", "roast": "medium"}
    r = client.post("/api/coffees/", json=payload)
    coffee_id = r.json()["id"]
    r2 = client.delete(f"/api/coffees/{coffee_id}")
    assert r2.status_code == 204
    assert client.get(f"/api/coffees/{coffee_id}").status_code == 404


# ── Shots ──────────────────────────────────────────────────

def _create_coffee(client):
    return client.post("/api/coffees/", json={
        "name": "X", "roaster": "Y", "roast": "light"
    }).json()


def test_list_shots_empty(client):
    r = client.get("/api/shots/")
    assert r.status_code == 200
    assert r.json() == []


def test_create_and_get_shot(client):
    coffee = _create_coffee(client)
    payload = {
        "coffeeId": coffee["id"], "dose": 18.0, "yield": 36.0,
        "time": 27, "grinder": 12.0, "rating": 5, "dialedIn": False,
    }
    r = client.post("/api/shots/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["yield"] == 36.0
    assert "coffeeId" in data


def test_list_shots_filter_by_coffee_id(client):
    c1 = _create_coffee(client)
    c2 = client.post("/api/coffees/", json={"name": "B", "roaster": "Z", "roast": "dark"}).json()
    base = {"dose": 18.0, "yield": 36.0, "time": 27, "grinder": 12.0, "rating": 3, "dialedIn": False}
    client.post("/api/shots/", json={**base, "coffeeId": c1["id"]})
    client.post("/api/shots/", json={**base, "coffeeId": c2["id"]})
    r = client.get(f"/api/shots/?coffee_id={c1['id']}")
    assert len(r.json()) == 1


def test_delete_shot(client):
    coffee = _create_coffee(client)
    r = client.post("/api/shots/", json={
        "coffeeId": coffee["id"], "dose": 18.0, "yield": 36.0,
        "time": 27, "grinder": 12.0, "rating": 4, "dialedIn": False,
    })
    shot_id = r.json()["id"]
    assert client.delete(f"/api/shots/{shot_id}").status_code == 204


# ── Recipes ────────────────────────────────────────────────

def test_list_recipes_empty(client):
    r = client.get("/api/recipes/")
    assert r.status_code == 200
    assert r.json() == []


def test_create_recipe_sets_author_from_profile(client):
    # First set the profile name
    client.put("/api/profile/", json={
        "name": "Joaquín", "email": "j@test.com", "username": "jq"
    })
    payload = {"coffeeName": "Ethiopia", "roast": "light", "dose": 18.0,
               "yield": 36.0, "time": 27, "grinder": 12.0}
    r = client.post("/api/recipes/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["author"] == "Joaquín"
    assert "createdAt" in data


def test_like_recipe(client):
    client.put("/api/profile/", json={"name": "User", "email": "", "username": "u"})
    r = client.post("/api/recipes/", json={
        "coffeeName": "X", "roast": "dark", "dose": 18.0,
        "yield": 36.0, "time": 27, "grinder": 11.0,
    })
    recipe_id = r.json()["id"]
    r2 = client.post(f"/api/recipes/{recipe_id}/like")
    assert r2.json()["likes"] == 1


def test_delete_recipe(client):
    client.put("/api/profile/", json={"name": "User", "email": "", "username": "u"})
    r = client.post("/api/recipes/", json={
        "coffeeName": "Y", "roast": "light", "dose": 18.0,
        "yield": 36.0, "time": 28, "grinder": 12.0,
    })
    rid = r.json()["id"]
    assert client.delete(f"/api/recipes/{rid}").status_code == 204


# ── Profile ────────────────────────────────────────────────

def test_get_profile_default(client):
    r = client.get("/api/profile/")
    assert r.status_code == 200
    assert "id" in r.json()


def test_update_profile(client):
    r = client.put("/api/profile/", json={
        "name": "Joaquín", "email": "j@test.com", "username": "jq",
        "bio": "Espresso nerd", "machine": "Gaggia Classic Pro", "grinder": "Eureka",
    })
    assert r.status_code == 200
    assert r.json()["name"] == "Joaquín"


# ── Settings ───────────────────────────────────────────────

def test_get_settings_default(client):
    r = client.get("/api/settings/")
    assert r.status_code == 200
    assert r.json()["language"] == "English"
    assert "defaultDose" in r.json()


def test_update_settings(client):
    r = client.put("/api/settings/", json={
        "language": "Español", "units": "metric",
        "defaultDose": 17.0, "defaultYield": 34.0, "defaultTime": 28,
    })
    assert r.status_code == 200
    assert r.json()["language"] == "Español"
```

- [ ] **Step 2: Run tests — expect FAIL (routes return None)**

```bash
cd backend && python3 -m pytest tests/test_routes.py -v
```

Expected: multiple failures — routes still return `None`.

- [ ] **Step 3: Implement coffees.py**

Replace `backend/routes/coffees.py`:
```python
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
```

- [ ] **Step 4: Implement shots.py**

Replace `backend/routes/shots.py`:
```python
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
```

- [ ] **Step 5: Implement recipes.py**

Replace `backend/routes/recipes.py`:
```python
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
```

- [ ] **Step 6: Implement profile.py**

Replace `backend/routes/profile.py`:
```python
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
```

- [ ] **Step 7: Implement settings.py**

Replace `backend/routes/settings.py`:
```python
from fastapi import APIRouter, Depends
from database import get_db
from models import Settings, SettingsUpdate
import crud

router = APIRouter()


@router.get("/", response_model=Settings)
def get_settings(conn=Depends(get_db)):
    return crud.get_settings(conn)


@router.put("/", response_model=Settings)
def update_settings(body: SettingsUpdate, conn=Depends(get_db)):
    return crud.update_settings(conn, body.model_dump())
```

- [ ] **Step 8: Run all backend tests — expect PASS**

```bash
cd backend && python3 -m pytest tests/ -v
```

Expected: `~35 passed` (all database, model, crud, and route tests).

---

## Task 7: frontend/src/api.js

**Files:**
- Create: `frontend/src/api.js`

- [ ] **Step 1: Create api.js**

Create `frontend/src/api.js`:
```js
const BASE = 'http://localhost:8000/api'

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const r = await fetch(`${BASE}${path}`, opts)
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status}`)
  if (r.status === 204) return null
  return r.json()
}

// Coffees
export const getCoffees     = ()       => request('GET',    '/coffees/')
export const createCoffee   = (data)   => request('POST',   '/coffees/', data)
export const deleteCoffee   = (id)     => request('DELETE', `/coffees/${id}`)

// Shots
export const getShots       = (coffeeId) =>
  request('GET', `/shots/${coffeeId != null ? `?coffee_id=${coffeeId}` : ''}`)
export const createShot     = (data)   => request('POST',   '/shots/', data)
export const deleteShot     = (id)     => request('DELETE', `/shots/${id}`)

// Recipes
export const getRecipes     = ()       => request('GET',    '/recipes/')
export const createRecipe   = (data)   => request('POST',   '/recipes/', data)
export const likeRecipe     = (id)     => request('POST',   `/recipes/${id}/like`)
export const deleteRecipe   = (id)     => request('DELETE', `/recipes/${id}`)

// Profile
export const getProfile     = ()       => request('GET',    '/profile/')
export const updateProfile  = (data)   => request('PUT',    '/profile/', data)

// Settings
export const getSettings    = ()       => request('GET',    '/settings/')
export const updateSettings = (data)   => request('PUT',    '/settings/', data)
```

- [ ] **Step 2: Smoke-test the API module manually**

Start the backend:
```bash
cd backend && python3 -m uvicorn main:app --reload --port 8000
```

In a second terminal:
```bash
curl -s http://localhost:8000/api/coffees/ | python3 -m json.tool
```

Expected: `[]`

```bash
curl -s -X POST http://localhost:8000/api/coffees/ \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ethiopia","roaster":"Onyx","roast":"light"}' | python3 -m json.tool
```

Expected: JSON with `"id": 1`, `"roastDate": null`, etc. (camelCase keys).

---

## Task 8: CoffeesPage — replace mocks

**Files:**
- Modify: `frontend/src/pages/CoffeesPage.jsx`

- [ ] **Step 1: Replace CoffeesPage.jsx**

Replace the file content (preserve all JSX rendering; only change state management):
```jsx
import { useState, useEffect, useCallback } from 'react'
import { getCoffees, createCoffee, deleteCoffee } from '../api'
import CoffeeForm    from '../components/coffees/CoffeeForm'
import ConfirmDialog from '../components/ConfirmDialog'

const roastDot = { light: 'bg-amber-300', medium: 'bg-orange-500', dark: 'bg-stone-500' }

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function CoffeesPage() {
  const [coffees, setCoffees]   = useState([])
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(() => {
    getCoffees().then(setCoffees).catch(console.error)
  }, [])

  useEffect(() => { load() }, [load])

  function handleAdd(form) {
    createCoffee({
      name:      form.name,
      roaster:   form.roaster,
      origin:    form.origin    || null,
      altitude:  form.altitude  || null,
      process:   form.process   || null,
      roast:     form.roast,
      roastDate: form.roastDate || null,
      notes:     form.notes     || null,
    }).then(() => { load(); setShowForm(false) }).catch(console.error)
  }

  function handleDeleteConfirm() {
    deleteCoffee(toDelete.id)
      .then(() => { load(); setToDelete(null) })
      .catch(console.error)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-ink-primary font-semibold text-base">Coffees</h1>
          <span className="text-ink-muted text-xs bg-app-surface border border-app-border rounded px-1.5 py-0.5">{coffees.length}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Coffee
        </button>
      </div>

      <div className="flex items-center px-6 py-2.5 border-b border-app-border text-ink-muted text-xs font-medium flex-shrink-0 gap-4">
        <span className="flex-1 min-w-0">Name</span>
        <span className="w-36 hidden sm:block">Roaster</span>
        <span className="w-24 hidden md:block">Origin</span>
        <span className="w-20 hidden md:block">Process</span>
        <span className="w-16">Roast</span>
        <span className="w-20 text-right hidden lg:block">Roast date</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {coffees.map(c => (
          <div key={c.id} className="flex items-center px-6 py-3.5 hover:bg-app-hover border-b border-app-border gap-4 group transition-colors">
            <div className="flex-1 min-w-0 flex items-center gap-2.5">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${roastDot[c.roast]}`} />
              <div className="min-w-0">
                <span className="text-ink-primary text-sm font-medium">{c.name}</span>
                <span className="text-ink-muted text-sm ml-2 hidden xl:inline">{c.notes}</span>
              </div>
            </div>
            <span className="w-36 text-ink-secondary text-sm truncate hidden sm:block">{c.roaster}</span>
            <span className="w-24 text-ink-secondary text-sm hidden md:block">{c.origin}</span>
            <span className="w-20 text-ink-secondary text-sm hidden md:block">{c.process}</span>
            <span className="w-16 text-ink-secondary text-sm capitalize">{c.roast}</span>
            <span className="w-20 text-right text-ink-muted text-sm hidden lg:block">{fmtDate(c.roastDate)}</span>
            <button
              onClick={() => setToDelete(c)}
              className="w-8 flex justify-end text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {showForm && <CoffeeForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}
      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.name}"?`}
          message="This coffee and all its shots will be permanently removed."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Smoke test**

With both servers running, open `http://localhost:5173`, navigate to Coffees. Add a coffee — it should appear. Refresh the page — it should persist (loaded from API, not state).

---

## Task 9: ShotsPage — replace mocks

**Files:**
- Modify: `frontend/src/pages/ShotsPage.jsx`

- [ ] **Step 1: Replace ShotsPage.jsx**

```jsx
import { useState, useEffect, useCallback } from 'react'
import { getCoffees, getShots, createShot, deleteShot, getRecipes } from '../api'
import ShotForm      from '../components/shots/ShotForm'
import ConfirmDialog from '../components/ConfirmDialog'

function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i <= n ? 'bg-amber-400' : 'bg-app-border'}`} />
      ))}
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function ShotsPage() {
  const [coffees,   setCoffees]   = useState([])
  const [recipes,   setRecipes]   = useState([])
  const [shots,     setShots]     = useState([])
  const [selected,  setSelected]  = useState(null)
  const [showForm,  setShowForm]  = useState(false)
  const [toDelete,  setToDelete]  = useState(null)

  // Load coffees + recipes once on mount
  useEffect(() => {
    Promise.all([getCoffees(), getRecipes()])
      .then(([cs, rs]) => {
        setCoffees(cs)
        setRecipes(rs)
        if (cs.length > 0) setSelected(cs[0])
      })
      .catch(console.error)
  }, [])

  // Reload shots when selected coffee changes
  const loadShots = useCallback((coffeeId) => {
    if (coffeeId == null) return
    getShots(coffeeId).then(setShots).catch(console.error)
  }, [])

  useEffect(() => {
    if (selected) loadShots(selected.id)
  }, [selected, loadShots])

  function handleAdd(form) {
    createShot({
      coffeeId:  Number(form.coffeeId),
      recipeId:  form.recipeId ? Number(form.recipeId) : null,
      dose:      Number(form.dose),
      yield:     Number(form.yield),
      time:      Number(form.time),
      grinder:   Number(form.grinder),
      rating:    Number(form.rating),
      notes:     form.notes || null,
      dialedIn:  Boolean(form.dialedIn),
      date:      new Date().toISOString().split('T')[0],
    })
      .then(() => { loadShots(selected?.id); setShowForm(false) })
      .catch(console.error)
  }

  function handleDeleteConfirm() {
    deleteShot(toDelete.id)
      .then(() => { loadShots(selected?.id); setToDelete(null) })
      .catch(console.error)
  }

  function recipeName(id) {
    if (!id) return null
    const r = recipes.find(r => r.id === id)
    return r ? r.coffeeName : null
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-ink-primary font-semibold text-base">Shots</h1>
          <span className="text-ink-muted text-xs bg-app-surface border border-app-border rounded px-1.5 py-0.5">{shots.length}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Record Shot
        </button>
      </div>

      <div className="flex items-center gap-1 px-6 py-2.5 border-b border-app-border flex-shrink-0 overflow-x-auto">
        {coffees.map(c => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap transition-colors ${
              selected?.id === c.id
                ? 'bg-app-hover text-ink-primary'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-app-hover'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex items-center px-6 py-2.5 border-b border-app-border text-ink-muted text-xs font-medium flex-shrink-0 gap-4">
        <span className="w-16">Date</span>
        <span className="w-20">Dose / Yield</span>
        <span className="w-14 hidden sm:block">Time</span>
        <span className="w-16 hidden sm:block">Grinder</span>
        <span className="w-16">Rating</span>
        <span className="flex-1 hidden md:block">Notes</span>
        <span className="w-24 hidden lg:block">Recipe</span>
        <span className="w-20 text-right">Status</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {shots.map(s => (
          <div key={s.id} className="flex items-center px-6 py-3.5 hover:bg-app-hover border-b border-app-border gap-4 group transition-colors">
            <span className="w-16 text-ink-secondary text-sm">{fmtDate(s.date)}</span>
            <span className="w-20 text-ink-primary text-sm font-medium tabular-nums">{s.dose}g → {s.yield}g</span>
            <span className="w-14 text-ink-secondary text-sm hidden sm:block tabular-nums">{s.time}s</span>
            <span className="w-16 text-ink-secondary text-sm hidden sm:block">#{s.grinder}</span>
            <div className="w-16"><Stars n={s.rating} /></div>
            <span className="flex-1 text-ink-muted text-sm truncate hidden md:block">{s.notes}</span>
            <span className="w-24 hidden lg:block">
              {recipeName(s.recipeId)
                ? <span className="text-xs bg-app-accent/10 text-app-accent border border-app-accent/20 px-2 py-0.5 rounded-full truncate max-w-full block">{recipeName(s.recipeId)}</span>
                : <span className="text-ink-muted text-sm">–</span>
              }
            </span>
            <div className="w-20 flex justify-end">
              {s.dialedIn
                ? <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">Dialed in</span>
                : <span className="text-sm text-ink-muted">–</span>
              }
            </div>
            <button
              onClick={() => setToDelete(s)}
              className="w-8 flex justify-end text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <ShotForm
          coffees={coffees}
          recipes={recipes}
          selectedCoffee={selected}
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
      {toDelete && (
        <ConfirmDialog
          title="Delete shot?"
          message={`Shot from ${fmtDate(toDelete.date)} will be permanently removed.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Smoke test**

Navigate to Shots. Add a coffee first (Coffees page), then record a shot — it should appear under that coffee tab, persist on refresh.

---

## Task 10: RecipesPage, ProfilePage, SettingsPage — replace mocks

**Files:**
- Modify: `frontend/src/pages/RecipesPage.jsx`
- Modify: `frontend/src/pages/ProfilePage.jsx`
- Modify: `frontend/src/pages/SettingsPage.jsx`

- [ ] **Step 1: Replace RecipesPage.jsx**

```jsx
import { useState, useEffect, useCallback } from 'react'
import { getRecipes, createRecipe, likeRecipe, deleteRecipe } from '../api'
import RecipeForm    from '../components/recipes/RecipeForm'
import ConfirmDialog from '../components/ConfirmDialog'

const roastColor = { light: 'text-amber-400', medium: 'text-orange-400', dark: 'text-stone-400' }

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Avatar({ name }) {
  return (
    <div className="w-6 h-6 rounded-full bg-app-surface border border-app-border flex items-center justify-center text-xs text-ink-secondary font-medium flex-shrink-0">
      {name[0].toUpperCase()}
    </div>
  )
}

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
)

export default function RecipesPage() {
  const [recipes,   setRecipes]   = useState([])
  const [showForm,  setShowForm]  = useState(false)
  const [toDelete,  setToDelete]  = useState(null)

  const load = useCallback(() => {
    getRecipes().then(setRecipes).catch(console.error)
  }, [])

  useEffect(() => { load() }, [load])

  function handleAdd(form) {
    createRecipe({
      coffeeName: form.coffeeName,
      roaster:    form.roaster   || null,
      roast:      form.roast,
      dose:       Number(form.dose),
      yield:      Number(form.yield),
      time:       Number(form.time),
      grinder:    Number(form.grinder),
      notes:      form.notes     || null,
    }).then(() => { load(); setShowForm(false) }).catch(console.error)
  }

  function handleLike(id) {
    likeRecipe(id).then(updated => {
      setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    }).catch(console.error)
  }

  function handleDeleteConfirm() {
    deleteRecipe(toDelete.id)
      .then(() => { load(); setToDelete(null) })
      .catch(console.error)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-ink-primary font-semibold text-base">Recipes</h1>
          <span className="text-ink-muted text-xs bg-app-surface border border-app-border rounded px-1.5 py-0.5">{recipes.length}</span>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Share Recipe
        </button>
      </div>

      <div className="flex items-center px-6 py-2.5 border-b border-app-border text-ink-muted text-xs font-medium flex-shrink-0 gap-4">
        <span className="flex-1 min-w-0">Coffee</span>
        <span className="w-16 hidden sm:block">Roast</span>
        <span className="w-28 hidden md:block">Params</span>
        <span className="w-12 hidden md:block">Ratio</span>
        <span className="w-24 hidden lg:block">Notes</span>
        <span className="w-24 hidden sm:block">Author</span>
        <span className="w-12 text-right">Likes</span>
        <span className="w-16 text-right hidden lg:block">Date</span>
        <span className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {recipes.map(r => (
          <div key={r.id} className="flex items-center px-6 py-3.5 hover:bg-app-hover border-b border-app-border gap-4 group transition-colors">
            <div className="flex-1 min-w-0">
              <span className="text-ink-primary text-sm font-medium truncate block">{r.coffeeName}</span>
              <span className="text-ink-muted text-xs truncate block">{r.roaster}</span>
            </div>
            <span className={`w-16 text-sm capitalize hidden sm:block ${roastColor[r.roast]}`}>{r.roast}</span>
            <span className="w-28 text-ink-secondary text-sm hidden md:block tabular-nums">{r.dose}g · {r.yield}g · {r.time}s · #{r.grinder}</span>
            <span className="w-12 text-ink-muted text-sm hidden md:block tabular-nums">1:{(r.yield / r.dose).toFixed(1)}</span>
            <span className="w-24 text-ink-muted text-sm truncate hidden lg:block">{r.notes}</span>
            <div className="w-24 items-center gap-1.5 hidden sm:flex">
              <Avatar name={r.author} />
              <span className="text-ink-secondary text-sm truncate">{r.author}</span>
            </div>
            <button
              onClick={() => handleLike(r.id)}
              className="w-12 flex items-center justify-end gap-1 text-ink-muted hover:text-red-400 text-sm transition-colors"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {r.likes}
            </button>
            <span className="w-16 text-right text-ink-muted text-sm hidden lg:block">{fmtDate(r.createdAt)}</span>
            <button
              onClick={() => setToDelete(r)}
              className="w-8 flex justify-end text-ink-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>

      {showForm && <RecipeForm onSubmit={handleAdd} onClose={() => setShowForm(false)} />}
      {toDelete && (
        <ConfirmDialog
          title={`Delete "${toDelete.coffeeName}" recipe?`}
          message="This recipe will be permanently removed."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Replace ProfilePage.jsx**

```jsx
import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../api'

export default function ProfilePage() {
  const empty = { name: '', email: '', username: '', bio: '', machine: '', grinder: '' }
  const [profile, setProfile] = useState(empty)
  const [editing, setEditing] = useState(false)
  const [form,    setForm]    = useState(empty)

  useEffect(() => {
    getProfile().then(p => { setProfile(p); setForm(p) }).catch(console.error)
  }, [])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSave(e) {
    e.preventDefault()
    updateProfile({
      name:     form.name,
      email:    form.email,
      username: form.username,
      bio:      form.bio      || null,
      machine:  form.machine  || null,
      grinder:  form.grinder  || null,
    })
      .then(updated => { setProfile(updated); setForm(updated); setEditing(false) })
      .catch(console.error)
  }

  function handleCancel() { setForm(profile); setEditing(false) }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <h1 className="text-ink-primary font-semibold text-base">Profile</h1>
        {!editing && <button onClick={() => setEditing(true)} className="btn-ghost">Edit</button>}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-lg">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white text-xl font-semibold">
            {profile.name ? profile.name[0] : '?'}
          </div>
          <div>
            <p className="text-ink-primary font-semibold text-sm">{profile.name}</p>
            <p className="text-ink-muted text-sm">@{profile.username}</p>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Name</label><input name="name" value={form.name} onChange={handleChange} className="input" /></div>
              <div><label className="label">Username</label><input name="username" value={form.username} onChange={handleChange} className="input" /></div>
            </div>
            <div><label className="label">Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className="input" /></div>
            <div><label className="label">Bio</label><textarea name="bio" value={form.bio || ''} onChange={handleChange} rows={2} className="input resize-none" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label">Machine</label><input name="machine" value={form.machine || ''} onChange={handleChange} className="input" /></div>
              <div><label className="label">Grinder</label><input name="grinder" value={form.grinder || ''} onChange={handleChange} className="input" /></div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleCancel} className="btn-ghost flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Save changes</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <Field label="Email"   value={profile.email} />
            <Field label="Bio"     value={profile.bio} />
            <Field label="Machine" value={profile.machine} />
            <Field label="Grinder" value={profile.grinder} />
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="border-b border-app-border pb-4">
      <p className="label mb-1">{label}</p>
      <p className="text-ink-primary text-sm">{value || <span className="text-ink-muted">—</span>}</p>
    </div>
  )
}
```

- [ ] **Step 3: Replace SettingsPage.jsx**

```jsx
import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '../api'

export default function SettingsPage() {
  const defaults = { language: 'English', units: 'metric', defaultDose: 18, defaultYield: 36, defaultTime: 27 }
  const [settings, setSettings] = useState(defaults)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    getSettings().then(setSettings).catch(console.error)
  }, [])

  function handleChange(e) {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSaved(false)
  }

  function handleSave(e) {
    e.preventDefault()
    updateSettings({
      language:     settings.language,
      units:        settings.units,
      defaultDose:  Number(settings.defaultDose),
      defaultYield: Number(settings.defaultYield),
      defaultTime:  Number(settings.defaultTime),
    })
      .then(updated => { setSettings(updated); setSaved(true) })
      .catch(console.error)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border flex-shrink-0">
        <h1 className="text-ink-primary font-semibold text-base">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-lg">
        <form onSubmit={handleSave} className="space-y-6">
          <section>
            <h2 className="text-ink-primary text-sm font-semibold mb-3">General</h2>
            <div className="space-y-3">
              <div>
                <label className="label">Language</label>
                <select name="language" value={settings.language} onChange={handleChange} className="input">
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                <label className="label">Units</label>
                <select name="units" value={settings.units} onChange={handleChange} className="input">
                  <option value="metric">Metric (g, ml)</option>
                  <option value="imperial">Imperial (oz)</option>
                </select>
              </div>
            </div>
          </section>
          <div className="border-t border-app-border" />
          <section>
            <h2 className="text-ink-primary text-sm font-semibold mb-1">Shot defaults</h2>
            <p className="text-ink-muted text-xs mb-3">Pre-fill values when recording a new shot.</p>
            <div className="grid grid-cols-3 gap-3">
              <div><label className="label">Dose (g)</label><input type="number" name="defaultDose" value={settings.defaultDose} onChange={handleChange} step="0.1" className="input" /></div>
              <div><label className="label">Yield (g)</label><input type="number" name="defaultYield" value={settings.defaultYield} onChange={handleChange} step="0.1" className="input" /></div>
              <div><label className="label">Time (s)</label><input type="number" name="defaultTime" value={settings.defaultTime} onChange={handleChange} className="input" /></div>
            </div>
          </section>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary">Save settings</button>
            {saved && <span className="text-emerald-400 text-sm">Saved</span>}
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Smoke test all pages**

Start both servers:
```bash
# Terminal 1
cd backend && python3 -m uvicorn main:app --reload --port 8000

# Terminal 2
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
cd frontend && node node_modules/.bin/vite --port 5173
```

Open `http://localhost:5173` and verify:
1. **Coffees** — add a coffee, refresh, it persists.
2. **Shots** — coffee tabs appear from API; record a shot, it persists on refresh.
3. **Recipes** — share a recipe, author populated from profile name; like button increments.
4. **Profile** — edit name/email, save, refresh — changes persist.
5. **Settings** — change language, save — refresh shows updated value.

---

## Self-Review Notes

**Spec coverage:**
- ✅ SQLite schema (Task 2)
- ✅ `get_connection` + `get_db` dependency (Task 2)
- ✅ Singleton seeding for profile + settings (Task 2)
- ✅ camelCase alias_generator + `yield_` alias (Task 3)
- ✅ `created_at` added to Recipe (Task 3)
- ✅ `crud.py` with all operations (Tasks 4–5)
- ✅ `author` populated from profile on recipe create (Task 6, recipes.py)
- ✅ All 17 route handlers wired (Task 6)
- ✅ `api.js` central module (Task 7)
- ✅ All 5 pages rewired with `useEffect` + api.js (Tasks 8–10)
- ✅ `backend/.gitignore` for gaggimate.db (Task 1)

**Type consistency check:**
- `crud.create_shot` receives `data` with key `yield_` (from `body.model_dump()`) and uses `:yield_` in SQL → column `yield` in DB → returned dict has key `yield` → Pydantic `Shot.model_validate({"yield": ...})` resolves via `Field(alias="yield")` ✓
- `crud.create_recipe` receives `yield_` same pattern ✓
- Route `shots.py` calls `body.model_dump()` (no args) → returns snake_case with `yield_` key ✓
- `update_settings` receives `defaultDose` (camelCase from frontend) → `body.model_dump()` returns `default_dose` (snake_case field name) → SQL uses `:default_dose` ✓
