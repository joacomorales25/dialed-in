import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))


# ── Coffees ────────────────────────────────────────────────

def test_list_coffees_empty(client):
    r = client.get("/api/coffees/")
    assert r.status_code == 200
    assert r.json() == []


def test_create_and_get_coffee(client):
    payload = {"name": "Ethiopia", "roaster": "Onyx", "roast": "light"}
    r = client.post("/api/coffees/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Ethiopia"
    assert "id" in data
    assert "roastDate" in data   # camelCase alias

    r2 = client.get(f"/api/coffees/{data['id']}")
    assert r2.status_code == 200
    assert r2.json()["name"] == "Ethiopia"


def test_get_coffee_not_found(client):
    r = client.get("/api/coffees/999")
    assert r.status_code == 404


def test_delete_coffee(client):
    payload = {"name": "Colombia", "roaster": "Intelli", "roast": "medium"}
    r = client.post("/api/coffees/", json=payload)
    coffee_id = r.json()["id"]
    r2 = client.delete(f"/api/coffees/{coffee_id}")
    assert r2.status_code == 204
    assert client.get(f"/api/coffees/{coffee_id}").status_code == 404


# ── Shots ──────────────────────────────────────────────────

def _create_coffee(client):
    return client.post("/api/coffees/", json={
        "name": "X", "roaster": "Y", "roast": "light"
    }).json()


def test_list_shots_empty(client):
    r = client.get("/api/shots/")
    assert r.status_code == 200
    assert r.json() == []


def test_create_and_get_shot(client):
    coffee = _create_coffee(client)
    payload = {
        "coffeeId": coffee["id"], "dose": 18.0, "yield": 36.0,
        "time": 27, "grinder": 12.0, "rating": 5, "dialedIn": False,
    }
    r = client.post("/api/shots/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["yield"] == 36.0
    assert "coffeeId" in data


def test_list_shots_filter_by_coffee_id(client):
    c1 = _create_coffee(client)
    c2 = client.post("/api/coffees/", json={"name": "B", "roaster": "Z", "roast": "dark"}).json()
    base = {"dose": 18.0, "yield": 36.0, "time": 27, "grinder": 12.0, "rating": 3, "dialedIn": False}
    client.post("/api/shots/", json={**base, "coffeeId": c1["id"]})
    client.post("/api/shots/", json={**base, "coffeeId": c2["id"]})
    r = client.get(f"/api/shots/?coffee_id={c1['id']}")
    assert len(r.json()) == 1


def test_delete_shot(client):
    coffee = _create_coffee(client)
    r = client.post("/api/shots/", json={
        "coffeeId": coffee["id"], "dose": 18.0, "yield": 36.0,
        "time": 27, "grinder": 12.0, "rating": 4, "dialedIn": False,
    })
    shot_id = r.json()["id"]
    assert client.delete(f"/api/shots/{shot_id}").status_code == 204


# ── Recipes ────────────────────────────────────────────────

def test_list_recipes_empty(client):
    r = client.get("/api/recipes/")
    assert r.status_code == 200
    assert r.json() == []


def test_create_recipe_sets_author_from_profile(client):
    # First set the profile name
    client.put("/api/profile/", json={
        "name": "Joaquín", "email": "j@test.com", "username": "jq"
    })
    payload = {"coffeeName": "Ethiopia", "roast": "light", "dose": 18.0,
               "yield": 36.0, "time": 27, "grinder": 12.0}
    r = client.post("/api/recipes/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["author"] == "Joaquín"
    assert "createdAt" in data


def test_like_recipe(client):
    client.put("/api/profile/", json={"name": "User", "email": "", "username": "u"})
    r = client.post("/api/recipes/", json={
        "coffeeName": "X", "roast": "dark", "dose": 18.0,
        "yield": 36.0, "time": 27, "grinder": 11.0,
    })
    recipe_id = r.json()["id"]
    r2 = client.post(f"/api/recipes/{recipe_id}/like")
    assert r2.json()["likes"] == 1


def test_delete_recipe(client):
    client.put("/api/profile/", json={"name": "User", "email": "", "username": "u"})
    r = client.post("/api/recipes/", json={
        "coffeeName": "Y", "roast": "light", "dose": 18.0,
        "yield": 36.0, "time": 28, "grinder": 12.0,
    })
    rid = r.json()["id"]
    assert client.delete(f"/api/recipes/{rid}").status_code == 204


# ── Profile ────────────────────────────────────────────────

def test_get_profile_default(client):
    r = client.get("/api/profile/")
    assert r.status_code == 200
    assert "id" in r.json()


def test_update_profile(client):
    r = client.put("/api/profile/", json={
        "name": "Joaquín", "email": "j@test.com", "username": "jq",
        "bio": "Espresso nerd", "machine": "Gaggia Classic Pro", "grinder": "Eureka",
    })
    assert r.status_code == 200
    assert r.json()["name"] == "Joaquín"


# ── Settings ───────────────────────────────────────────────

def test_get_settings_default(client):
    r = client.get("/api/settings/")
    assert r.status_code == 200
    assert r.json()["language"] == "English"
    assert "defaultDose" in r.json()


def test_update_settings(client):
    r = client.put("/api/settings/", json={
        "language": "Español", "units": "metric",
        "defaultDose": 17.0, "defaultYield": 34.0, "defaultTime": 28,
    })
    assert r.status_code == 200
    assert r.json()["language"] == "Español"
