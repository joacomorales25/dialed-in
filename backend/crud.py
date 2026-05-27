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
