# GaggiMate — Backend Wiring & Frontend API Integration Design

**Date:** 2026-05-26  
**Status:** Approved  
**Scope:** Implement SQLite schema, wire FastAPI route handlers, replace all frontend mocks with real `fetch()` calls.

---

## Sources

Every decision below cites its source:

- **[CLAUDE.md]** — project-level instructions (`/Users/joaquinmorales/gaggimate/CLAUDE.md`)
- **[models.py]** — existing Pydantic models (`backend/models.py`)
- **[routes/*.py]** — stub route handlers (`backend/routes/`)
- **[pages/*.jsx]** — frontend mock data and TODO comments (`frontend/src/pages/`)
- **[Pydantic v2 docs]** — `ConfigDict`, `alias_generator`, `populate_by_name`
- **[FastAPI docs]** — router patterns, `response_model`, `HTTPException`
- **[SQLite docs]** — `sqlite3.Row`, `INSERT OR IGNORE`, `RETURNING`

---

## 1. Pydantic Model Changes

**Source: [models.py] + [pages/*.jsx] + [CLAUDE.md]**

### 1a. camelCase alias generator

All pages use camelCase field names in mocks (`coffeeId`, `dialedIn`, `coffeeName`, `roastDate`, `defaultDose`). The backend models use `snake_case`. Rather than rename every frontend field, we configure Pydantic to emit camelCase automatically.

```python
# All models get:
model_config = ConfigDict(
    alias_generator=to_camel,
    populate_by_name=True,   # allow both snake_case and camelCase in Python
)
```

`populate_by_name=True` is required so route handlers can still pass `coffee_id=...` without using the alias. **[Pydantic v2 docs]**

### 1b. `yield_` field alias

`yield` is a Python keyword; Pydantic represents it as `yield_`. Without an explicit alias it would serialize as `yield_` in JSON, breaking frontend reads. We override it with `Field(alias="yield")`. **[CLAUDE.md]** explicitly documents this: *"`yield_` in Python → `yield` in JSON (Pydantic field alias)"*.

### 1c. `created_at` added to Recipe

`RecipesPage.jsx` accesses `r.createdAt` and `r.createdAt` in `fmtDate()`. The current `RecipeBase` model has no such field. We add `created_at: date` to `RecipeBase` so it round-trips through the API. **[pages/RecipesPage.jsx line 7–9, line 120]**

---

## 2. SQLite Schema

**Source: [models.py] field definitions; [CLAUDE.md] "raw sqlite3, no ORM"**

```sql
CREATE TABLE IF NOT EXISTS coffees (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    roaster    TEXT    NOT NULL,
    origin     TEXT,
    altitude   TEXT,
    process    TEXT,
    roast      TEXT    NOT NULL,
    roast_date TEXT,           -- stored as ISO-8601 string
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
    dialed_in  INTEGER NOT NULL DEFAULT 0,   -- SQLite has no BOOL
    date       TEXT                           -- ISO-8601
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
    created_at  TEXT    NOT NULL             -- ISO-8601
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
```

### Singleton seeding

`profile` and `settings` are single-row tables (id=1). `create_tables()` runs `INSERT OR IGNORE INTO profile (id) VALUES (1)` and `INSERT OR IGNORE INTO settings (id) VALUES (1)` after creating tables, so `GET /api/profile` and `GET /api/settings` always find a row even on first run. **[SQLite docs — INSERT OR IGNORE]**

### DB file location

`backend/gaggimate.db` — local, added to `.gitignore`. **[CLAUDE.md] "SQLite for local projects"**

### `get_connection()`

Returns `sqlite3.connect("gaggimate.db")` with `row_factory = sqlite3.Row` set, so rows behave like dicts and can be passed directly to Pydantic. **[SQLite docs — sqlite3.Row]**

---

## 3. backend/crud.py

**Source: [routes/*.py] stub signatures; [FastAPI docs] dependency patterns**

New file — one function per DB operation. All functions accept a `sqlite3.Connection` parameter (injected by the route handler). Functions return `dict | list[dict] | None`; they never raise — callers decide what to do with `None`.

```
Coffees:  get_all_coffees(conn)  → list[dict]
          create_coffee(conn, data: dict)  → dict
          get_coffee(conn, id)  → dict | None
          delete_coffee(conn, id)  → bool

Shots:    get_all_shots(conn, coffee_id=None)  → list[dict]
          create_shot(conn, data: dict)  → dict
          get_shot(conn, id)  → dict | None
          delete_shot(conn, id)  → bool

Recipes:  get_all_recipes(conn)  → list[dict]
          create_recipe(conn, data: dict)  → dict
          like_recipe(conn, id)  → dict | None
          delete_recipe(conn, id)  → bool

Profile:  get_profile(conn)  → dict
          update_profile(conn, data: dict)  → dict

Settings: get_settings(conn)  → dict
          update_settings(conn, data: dict)  → dict
```

Route handlers open a connection via `get_connection()`, call the appropriate crud function, close the connection, and raise `HTTPException(404)` if the result is `None`.

### Recipe `author` field

When `POST /api/recipes` is called, the route handler reads the current profile (`get_profile`) and sets `data["author"] = profile["name"]` before calling `create_recipe`. No auth system — this is a single-user local app. **[pages/RecipesPage.jsx line 50 — "author: 'Joaquín' // TODO: replace with logged-in user"]**

---

## 4. frontend/src/api.js

**Source: [pages/*.jsx] — TODO comments specify exact endpoint for each operation**

Central API module. One named export per operation. `BASE_URL` is a single constant. All functions use `fetch`, check `response.ok`, and throw on error. Pages never call `fetch` directly.

```js
const BASE = 'http://localhost:8000/api'

// Coffees
export async function getCoffees()              { … GET /coffees/ }
export async function createCoffee(data)        { … POST /coffees/ }
export async function deleteCoffee(id)          { … DELETE /coffees/:id }

// Shots
export async function getShots(coffeeId)        { … GET /shots/?coffee_id= }
export async function createShot(data)          { … POST /shots/ }
export async function deleteShot(id)            { … DELETE /shots/:id }

// Recipes
export async function getRecipes()              { … GET /recipes/ }
export async function createRecipe(data)        { … POST /recipes/ }
export async function likeRecipe(id)            { … POST /recipes/:id/like }
export async function deleteRecipe(id)          { … DELETE /recipes/:id }

// Profile
export async function getProfile()              { … GET /profile/ }
export async function updateProfile(data)       { … PUT /profile/ }

// Settings
export async function getSettings()             { … GET /settings/ }
export async function updateSettings(data)      { … PUT /settings/ }
```

---

## 5. Frontend Page Rewiring

**Source: [pages/*.jsx] — each page has explicit TODO comments pointing to the exact API call**

Each page:
1. Initialises state with `[]` / `{}` (empty, not mock data).
2. Adds `useEffect(() => { load() }, [])` that calls the api module and sets state.
3. CRUD handlers call api module, then re-call the load function.
4. Errors are logged via `console.error` (no toast/snackbar — YAGNI for a local app).

**Loading state:** empty initial array means the list appears empty for ~1 frame on localhost — acceptable without a spinner for a local tool. **[YAGNI principle]**

**ShotsPage** loads coffees AND shots in parallel via `Promise.all`. Recipes are also loaded (used for the recipe badge in the shot row). **[pages/ShotsPage.jsx — uses 3 mock arrays]**

**`yield` field in POST bodies:** when submitting form data to the backend, the frontend sends `{ yield: ... }` (not `yield_`). The Pydantic `Field(alias="yield")` handles deserialization correctly since `populate_by_name=True` is set. **[Pydantic v2 docs — alias + populate_by_name]**

---

## 6. Out of Scope

- Authentication / multi-user
- Toast notifications / error UI
- Pagination
- Edit (PUT) for coffees, shots
- Image uploads

These were all present in the frontend as hardcoded values or simply absent — removing them keeps the implementation focused. **[YAGNI]**

---

## File Changeset Summary

| File | Action |
|------|--------|
| `backend/database.py` | Implement `get_connection()` and `create_tables()` |
| `backend/models.py` | Add `ConfigDict` camelCase, `yield_` alias, `created_at` to Recipe |
| `backend/crud.py` | **New** — all DB operations |
| `backend/routes/coffees.py` | Implement 4 handlers |
| `backend/routes/shots.py` | Implement 4 handlers |
| `backend/routes/recipes.py` | Implement 5 handlers |
| `backend/routes/profile.py` | Implement 2 handlers |
| `backend/routes/settings.py` | Implement 2 handlers |
| `frontend/src/api.js` | **New** — all fetch calls |
| `frontend/src/pages/CoffeesPage.jsx` | Replace mocks with api.js |
| `frontend/src/pages/ShotsPage.jsx` | Replace mocks with api.js |
| `frontend/src/pages/RecipesPage.jsx` | Replace mocks with api.js |
| `frontend/src/pages/ProfilePage.jsx` | Replace mocks with api.js |
| `frontend/src/pages/SettingsPage.jsx` | Replace mocks with api.js |
| `backend/gaggimate.db` | **Generated at runtime** — add to .gitignore |
