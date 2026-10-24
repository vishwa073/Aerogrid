import pytest
from httpx import ASGITransport, AsyncClient
from unittest.mock import patch
from app.main import app
from app.core.config import settings


@pytest.mark.asyncio
async def test_root_health_endpoint():
    """Verify GET /health returns 200 OK with expected application metadata."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "AeroGrid"
        assert data["version"] == settings.VERSION
        assert "timestamp" in data
        # Database field is present in payload (liveness passes regardless)
        assert "database" in data


@pytest.mark.asyncio
async def test_api_v1_health_endpoint():
    """Verify GET /api/v1/health returns 200 OK."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        response = await client.get(f"{settings.API_V1_STR}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "AeroGrid"


@pytest.mark.asyncio
async def test_readiness_endpoint_when_db_connected():
    """Verify GET /health/ready returns 200 OK when database is reachable."""
    transport = ASGITransport(app=app)
    with patch("app.api.routes.health.check_database_health", return_value=(True, "connected")):
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.get("/health/ready")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "ready"
            assert data["database"] == "connected"


@pytest.mark.asyncio
async def test_readiness_endpoint_when_db_disconnected():
    """Verify GET /health/ready returns 503 Service Unavailable when database is unreachable."""
    transport = ASGITransport(app=app)
    with patch("app.api.routes.health.check_database_health", return_value=(False, "disconnected: ConnectionRefusedError")):
        async with AsyncClient(transport=transport, base_url="http://testserver") as client:
            response = await client.get("/health/ready")
            assert response.status_code == 503
            data = response.json()
            assert data["status"] == "not_ready"
            assert "ConnectionRefusedError" in data["database"]
