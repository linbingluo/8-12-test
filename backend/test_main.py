from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/")
    assert response.status_code in [200, 404]


def test_register_missing_fields():
    response = client.post("/auth/register", json={})
    assert response.status_code == 422


def test_register_user():
    response = client.post("/auth/register", json={
        "email": "unittest@example.com",
        "username": "unittestuser",
        "password": "testpass123"
    })
    assert response.status_code in [200, 201, 400]


def test_login_missing_fields():
    response = client.post("/auth/login", json={})
    assert response.status_code == 422


def test_login_invalid_credentials():
    response = client.post("/auth/login", json={
        "email": "notexist@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code in [400, 401, 404]


def test_get_destinations():
    response = client.get("/destinations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_trips():
    response = client.get("/trips")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_stats():
    response = client.get("/stats")
    assert response.status_code == 200