
import httpx
import pytest

from app.services.elexon_client import ElexonAPIError, ElexonClient


@pytest.mark.asyncio
async def test_fetch_actual_generation_returns_records(monkeypatch):
    records = [
        {
            "fuelType": "WIND",
            "startTime": "2026-01-01T00:00:00Z",
            "generation": 12500.0,
        }
    ]

    async def mock_get(self, url, **kwargs):
        return httpx.Response(
            200,
            json=records,
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    client = ElexonClient(base_url="https://example.test")
    result = await client.fetch_actual_generation({"fuelType": "WIND"})

    assert result == records


@pytest.mark.asyncio
async def test_fetch_wind_forecasts_preserves_publication_time(monkeypatch):
    records = [
        {
            "publishTime": "2026-01-01T08:00:00Z",
            "startTime": "2026-01-02T00:00:00Z",
            "generation": 14000.0,
        }
    ]

    async def mock_get(self, url, **kwargs):
        return httpx.Response(
            200,
            json=records,
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    client = ElexonClient(base_url="https://example.test")
    result = await client.fetch_wind_forecasts({})

    assert result[0]["publishTime"] == "2026-01-01T08:00:00Z"
    assert result[0]["startTime"] == "2026-01-02T00:00:00Z"


@pytest.mark.asyncio
async def test_http_error_is_converted_to_elexon_api_error(monkeypatch):
    async def mock_get(self, url, **kwargs):
        return httpx.Response(
            503,
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    client = ElexonClient(base_url="https://example.test")

    with pytest.raises(ElexonAPIError, match="HTTP 503"):
        await client.fetch_actual_generation({})


@pytest.mark.asyncio
async def test_unexpected_response_structure_is_rejected(monkeypatch):
    async def mock_get(self, url, **kwargs):
        return httpx.Response(
            200,
            json={"unexpected": "shape"},
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    client = ElexonClient(base_url="https://example.test")

    with pytest.raises(ElexonAPIError, match="Unexpected response"):
        await client.fetch_wind_forecasts({})


@pytest.mark.asyncio
async def test_fetch_wind_forecast_evolution_preserves_snapshots(monkeypatch):
    start_time = "2026-01-01T21:00:00Z"
    snapshots = [
        {
            "publishTime": "2026-01-01T09:30:00Z",
            "startTime": start_time,
            "generation": 18734,
        },
        {
            "publishTime": "2026-01-01T11:30:00Z",
            "startTime": start_time,
            "generation": 18785,
        },
    ]

    async def mock_get(self, url, **kwargs):
        assert url == (
            "https://example.com/forecast/generation/wind/evolution"
        )
        assert kwargs["params"] == {"startTime": start_time}

        return httpx.Response(
            200,
            json={
                "metadata": {"datasets": ["WINDFOR"]},
                "data": snapshots,
            },
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(httpx.AsyncClient, "get", mock_get)

    client = ElexonClient(base_url="https://example.com")
    records = await client.fetch_wind_forecast_evolution(start_time)

    assert records == snapshots
    assert len(records) == 2
    assert records[0]["publishTime"] == "2026-01-01T09:30:00Z"
    assert records[1]["publishTime"] == "2026-01-01T11:30:00Z"
