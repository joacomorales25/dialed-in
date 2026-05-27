---
name: run-gaggimate
description: Run, start, launch, screenshot, or test the gaggimate app. Use when asked to run the app, verify a change, or take a screenshot.
---

# /run-gaggimate

GaggiMate is a FastAPI backend + React/Vite frontend. Both servers must run together. Drive the UI via `chromium-cli` (web app — no custom driver needed).

## Prerequisites

```bash
# Python packages (already installed globally)
python3 -c "import fastapi, uvicorn"

# Node via nvm
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
node --version   # should print v24.x
```

## Start servers

```bash
# From gaggimate/ root:

# Backend (verified working)
cd backend && python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 > /tmp/gaggimate-backend.log 2>&1 &
sleep 2 && curl -s http://127.0.0.1:8000/api/health   # → {"status":"ok"}

# Frontend (verified working)
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
cd frontend && node node_modules/.bin/vite --host 127.0.0.1 --port 5173 > /tmp/gaggimate-frontend.log 2>&1 &
sleep 4 && curl -s http://127.0.0.1:5173/ | grep -o '<title>[^<]*</title>'  # → <title>Gaggimate</title>
```

## Run (agent path) — chromium-cli

```bash
chromium-cli navigate http://127.0.0.1:5173/coffees
chromium-cli screenshot /tmp/gaggimate-coffees.png
chromium-cli navigate http://127.0.0.1:5173/shots
chromium-cli screenshot /tmp/gaggimate-shots.png
```

Navigate to any route: `/coffees`, `/shots`, `/recipes`, `/profile`, `/settings`

## Stop servers

```bash
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "vite --host" 2>/dev/null || true
```

## Gotchas

- `node` is only in `~/.nvm/versions/node/v24.14.0/bin/` — not on the default PATH. Always prepend it.
- Frontend dep-installs: `node_modules/` already exists. Don't re-run `npm install` unless `package.json` changed.
- All backend route handlers return `pass` (HTTP 200 with `null` body). The API is intentionally a stub — frontend uses mock data hardcoded in each page component.
- The CORS origin is hardcoded to `http://localhost:5173` in `main.py`. Use `127.0.0.1` not `localhost` if you hit CORS issues (they resolve the same, but be consistent).

## Run (human path)

Open two terminal tabs from `gaggimate/`:
1. `cd backend && python3 -m uvicorn main:app --reload`
2. `export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH" && cd frontend && npm run dev`

Then open http://localhost:5173 in a browser.
