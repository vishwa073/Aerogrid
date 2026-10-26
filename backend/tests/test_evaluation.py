from datetime import datetime, timezone

from fastapi.testclient import TestClient

from app.main import app
from app.api.routes import evaluation
from app.api.routes.evaluation import normalize_timestamp

client = TestClient(app)


def test_normalize_timestamp_converts_to_utc():
    result = normalize_timestamp("2026-01-01T01:00:00+01:00")

    assert result == datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)


def test_normalize_timestamp_accepts_z_suffix():
    result = normalize_timestamp("2026-01-01T00:30:00Z")

    assert result == datetime(2026, 1, 1, 0, 30, tzinfo=timezone.utc)


def test_evaluation_returns_hourly_metrics(monkeypatch):
    async def fake_actuals(self, params):
        return [
            {"startTime": "2026-01-01T00:00:00Z", "generation": 100},
            {"startTime": "2026-01-01T00:30:00Z", "generation": 120},
        ]

    async def fake_forecasts(self, params):
        return [
            {
                "publishTime": "2025-12-31T10:30:00Z",
                "startTime": "2026-01-01T00:00:00Z",
                "generation": 110,
            }
        ]

    monkeypatch.setattr(
        evaluation.ElexonClient,
        "fetch_actual_generation",
        fake_actuals,
    )
    monkeypatch.setattr(
        evaluation.ElexonClient,
        "fetch_wind_forecasts",
        fake_forecasts,
    )

    response = client.get("/api/v1/evaluation/january-2026")

    assert response.status_code == 200
    data = response.json()
    assert data["comparison_resolution"] == "hourly"
    assert data["hourly_actual_interval_count"] == 1
    assert data["matched_interval_count"] == 1
    assert data["intervals"][0]["actual_mw"] == 110
    assert data["intervals"][0]["forecast_mw"] == 110
    assert data["intervals"][0]["forecast_publish_time"] == (
        "2025-12-31T10:30:00Z"
    )
    assert data["intervals"][0]["cutoff_time"] == (
        "2025-12-31T11:00:00Z"
    )


def test_evaluation_uses_configured_cutoff_when_query_is_omitted(monkeypatch):
    async def fake_actuals(self, params):
        return [
            {"startTime": "2026-01-01T00:00:00Z", "generation": 100},
            {"startTime": "2026-01-01T00:30:00Z", "generation": 120},
        ]

    async def fake_forecasts(self, params):
        return [
            {
                "publishTime": "2025-12-31T08:30:00Z",
                "startTime": "2026-01-01T00:00:00Z",
                "generation": 90,
            },
            {
                "publishTime": "2025-12-31T09:30:00Z",
                "startTime": "2026-01-01T00:00:00Z",
                "generation": 110,
            },
        ]

    monkeypatch.setattr(
        evaluation.settings,
        "DEFAULT_DECISION_CUTOFF_TIME",
        "09:00",
    )
    monkeypatch.setattr(
        evaluation.ElexonClient,
        "fetch_actual_generation",
        fake_actuals,
    )
    monkeypatch.setattr(
        evaluation.ElexonClient,
        "fetch_wind_forecasts",
        fake_forecasts,
    )

    response = client.get("/api/v1/evaluation/january-2026")

    assert response.status_code == 200
    data = response.json()
    assert data["cutoff_hour_utc"] == 9
    assert data["intervals"][0]["forecast_mw"] == 90
    assert data["intervals"][0]["forecast_publish_time"] == (
        "2025-12-31T08:30:00Z"
    )
    assert data["intervals"][0]["cutoff_time"] == (
        "2025-12-31T09:00:00Z"
    )


def test_explicit_cutoff_overrides_configured_default(monkeypatch):
    async def fake_actuals(self, params):
        return [
            {"startTime": "2026-01-01T00:00:00Z", "generation": 100},
            {"startTime": "2026-01-01T00:30:00Z", "generation": 120},
        ]

    async def fake_forecasts(self, params):
        return [
            {
                "publishTime": "2025-12-31T08:30:00Z",
                "startTime": "2026-01-01T00:00:00Z",
                "generation": 90,
            },
            {
                "publishTime": "2025-12-31T09:30:00Z",
                "startTime": "2026-01-01T00:00:00Z",
                "generation": 110,
            },
        ]

    monkeypatch.setattr(
        evaluation.settings,
        "DEFAULT_DECISION_CUTOFF_TIME",
        "09:00",
    )
    monkeypatch.setattr(
        evaluation.ElexonClient,
        "fetch_actual_generation",
        fake_actuals,
    )
    monkeypatch.setattr(
        evaluation.ElexonClient,
        "fetch_wind_forecasts",
        fake_forecasts,
    )

    response = client.get(
        "/api/v1/evaluation/january-2026?cutoff_hour_utc=10"
    )

    assert response.status_code == 200
    data = response.json()
    assert data["cutoff_hour_utc"] == 10
    assert data["intervals"][0]["forecast_mw"] == 110
    assert data["intervals"][0]["forecast_publish_time"] == (
        "2025-12-31T09:30:00Z"
    )
    assert data["intervals"][0]["cutoff_time"] == (
        "2025-12-31T10:00:00Z"
    )


def test_evaluation_returns_502_when_elexon_fails(monkeypatch):
    async def fail_actuals(self, params):
        raise evaluation.ElexonAPIError("test upstream failure")

    monkeypatch.setattr(
        evaluation.ElexonClient,
        "fetch_actual_generation",
        fail_actuals,
    )

    response = client.get("/api/v1/evaluation/january-2026")

    assert response.status_code == 502
    assert "Unable to retrieve Elexon data" in response.json()["detail"]