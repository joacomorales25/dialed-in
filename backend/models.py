from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from typing import Optional
from datetime import date as _date

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
    roast_date: Optional[_date] = None
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
    date:      Optional[_date]  = None

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
    created_at:  Optional[_date] = None

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
