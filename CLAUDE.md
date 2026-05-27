# DialedIn

Espresso shot tracker and recipe manager. Track coffees, log shots with parameters (dose, yield, time, grinder), and browse community recipes.

## Architecture

- **Backend**: FastAPI + Python 3, SQLite (raw `sqlite3`, no ORM). Lives in `backend/`.
  - `main.py` — app entry, CORS config, router registration
  - `database.py` — `get_connection()` and `create_tables()` (currently stubs — **not yet implemented**)
  - `models.py` — all Pydantic models (Coffee, Shot, Recipe, Profile, Settings)
  - `routes/` — one file per resource: `coffees.py`, `shots.py`, `recipes.py`, `profile.py`, `settings.py`
- **Frontend**: React 18 + Vite + Tailwind CSS. Lives in `frontend/`.
  - `src/App.jsx` — router, layout wrapper
  - `src/components/Layout.jsx` — sidebar nav
  - `src/pages/` — one page per route
  - `src/components/coffees|shots|recipes/` — form components

## Dev setup

```bash
# Backend (port 8000)
cd backend && python3 -m uvicorn main:app --reload --port 8000

# Frontend (port 5173)
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
cd frontend && node node_modules/.bin/vite --port 5173
```

Health check: `curl http://localhost:8000/api/health`

## Current state

**Backend**: All route handlers are stubs (`pass`). `database.py` has empty functions. SQLite schema not yet written.

**Frontend**: Pages use hardcoded `MOCK_*` data with `// TODO: replace with API call` comments. UI is complete and functional against mocks.

**Next**: Implement SQLite schema → wire route handlers → replace frontend mocks with `fetch()` calls.

## Conventions

- Python: type hints everywhere, Pydantic for all I/O, 4-space indent, `snake_case`
- JSX: functional components, Tailwind only (no `style={}`), 2-space indent
- `yield_` in Python → `yield` in JSON (Pydantic field alias)

## Running tests

No test suite yet. Smoke test:

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/coffees/
```
