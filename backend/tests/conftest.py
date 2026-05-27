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
