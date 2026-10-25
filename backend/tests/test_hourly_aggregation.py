
from datetime import datetime, timezone

from app.api.routes.evaluation import aggregate_actuals_hourly


def test_two_half_hourly_readings_are_averaged():
    records = [
        {"startTime": "2026-01-01T00:00:00Z", "generation": 100},
        {"startTime": "2026-01-01T00:30:00Z", "generation": 120},
    ]

    result = aggregate_actuals_hourly(records)

    hour = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
    assert result == {hour: 110.0}


def test_hour_with_missing_half_hourly_reading_is_excluded():
    records = [
        {"startTime": "2026-01-01T00:00:00Z", "generation": 100},
    ]

    assert aggregate_actuals_hourly(records) == {}


def test_missing_values_are_ignored():
    records = [
        {"startTime": "2026-01-01T00:00:00Z", "generation": 100},
        {"startTime": "2026-01-01T00:30:00Z", "generation": None},
    ]

    assert aggregate_actuals_hourly(records) == {}
