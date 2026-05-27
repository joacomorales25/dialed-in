from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables
from routes import coffees, shots, recipes, profile, settings

app = FastAPI(title="DialedIn API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_tables()

app.include_router(coffees.router,  prefix="/api/coffees",  tags=["coffees"])
app.include_router(shots.router,    prefix="/api/shots",    tags=["shots"])
app.include_router(recipes.router,  prefix="/api/recipes",  tags=["recipes"])
app.include_router(profile.router,  prefix="/api/profile",  tags=["profile"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])


@app.get("/api/health")
def health():
    return {"status": "ok"}
