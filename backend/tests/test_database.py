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
