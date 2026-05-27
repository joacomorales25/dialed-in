import os
import sqlite3
from typing import Generator

DB_PATH: str = os.path.join(os.path.dirname(__file__), "dialedin.db")

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
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
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
