import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "version" in data


def test_get_config():
    resp = client.get("/api/config")
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Dashlink"
    assert "theme" in data


def test_set_theme():
    resp = client.patch("/api/config/theme", params={"theme": "clean-flat"})
    assert resp.status_code == 200
    assert resp.json()["theme"] == "clean-flat"


def test_add_and_remove_service():
    service = {
        "id": "test-svc-1",
        "name": "Test Service",
        "url": "http://localhost:9999",
        "category": "Default",
    }
    resp = client.post("/api/config/services", json=service)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Test Service"

    resp = client.delete("/api/config/services/test-svc-1")
    assert resp.status_code == 200


def test_list_services():
    resp = client.get("/api/services")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
