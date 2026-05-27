from pydantic import BaseModel
from typing import Optional
from datetime import date


# ── Coffees ────────────────────────────────────────────────

class CoffeeBase(BaseModel):
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
    class Config:
        from_attributes = True


# ── Shots ──────────────────────────────────────────────────

class ShotBase(BaseModel):
    coffee_id: int
    recipe_id: Optional[int]   = None
    dose:      float
    yield_:    float
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
    class Config:
        from_attributes = True


# ── Recipes ────────────────────────────────────────────────

class RecipeBase(BaseModel):
    coffee_name: str
    roaster:     Optional[str] = None
    roast:       str
    dose:        float
    yield_:      float
    time:        int
    grinder:     float
    notes:       Optional[str] = None

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id:     int
    author: str
    likes:  int = 0
    class Config:
        from_attributes = True


# ── Profile ────────────────────────────────────────────────

class ProfileBase(BaseModel):
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
    class Config:
        from_attributes = True


# ── Settings ───────────────────────────────────────────────

class SettingsBase(BaseModel):
    language:      str   = "English"
    units:         str   = "metric"
    default_dose:  float = 18
    default_yield: float = 36
    default_time:  int   = 27

class SettingsUpdate(SettingsBase):
    pass

class Settings(SettingsBase):
    id: int
    class Config:
        from_attributes = True
