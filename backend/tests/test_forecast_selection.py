import pytest

from app.services.forecast_selection import select_forecast_snapshots


def test_selects_latest_forecast_before_day_ahead_cutoff():
    snapshots = [
        {
            "publishTime": "2025-12-31T07:30:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 20127,
        },
        {
            "publishTime": "2025-12-31T09:30:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 19980,
        },
        {
            "publishTime": "2025-12-31T11:30:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 19918,
        },
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2025-12-31T11:00:00Z",
    )

    assert len(result) == 1
    assert result[0]["publishTime"] == "2025-12-31T09:30:00Z"
    assert result[0]["generation"] == 19980

def test_forecast_published_exactly_at_cutoff_is_eligible():
    snapshots = [
        {
            "publishTime": "2026-01-01T11:00:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 19000,
        }
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2026-01-01T11:00:00Z",
    )

    assert len(result) == 1
    assert result[0]["generation"] == 19000


def test_returns_no_forecast_when_all_snapshots_are_too_late():
    snapshots = [
        {
            "publishTime": "2026-01-01T11:30:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 19918,
        }
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2026-01-01T11:00:00Z",
    )

    assert result == []


def test_selects_latest_eligible_forecast_for_each_interval():
    snapshots = [
        {
            "publishTime": "2026-01-01T08:00:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 18000,
        },
        {
            "publishTime": "2026-01-01T09:30:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 18500,
        },
        {
            "publishTime": "2026-01-01T09:00:00Z",
            "startTime": "2026-01-01T13:00:00Z",
            "generation": 19000,
        },
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2026-01-01T11:00:00Z",
    )

    assert len(result) == 2
    assert result[0]["generation"] == 18500
    assert result[1]["generation"] == 19000


def test_rejects_timestamp_without_timezone():
    snapshots = [
        {
            "publishTime": "2026-01-01T09:30:00",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 19980,
        }
    ]

    with pytest.raises(ValueError, match="timezone"):
        select_forecast_snapshots(
            snapshots,
            "2026-01-01T11:00:00Z",
        )
def test_compares_timestamps_with_different_utc_offsets():
    snapshots = [
        {
            "publishTime": "2026-01-01T10:30:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 18000,
        },
        {
            # 12:00 at UTC+02:00 is 10:00 UTC.
            "publishTime": "2026-01-01T12:00:00+02:00",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 19000,
        },
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2026-01-01T11:00:00Z",
    )

    assert len(result) == 1
    assert result[0]["generation"] == 18000

def test_excludes_forecast_one_second_after_cutoff():
    snapshots = [
        {
            "publishTime": "2026-01-01T11:00:01Z",
            "startTime": "2026-01-02T12:00:00Z",
            "generation": 20000,
        }
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2026-01-01T11:00:00Z",
    )

    assert result == []


def test_returns_results_in_delivery_time_order():
    snapshots = [
        {
            "publishTime": "2026-01-01T09:00:00Z",
            "startTime": "2026-01-01T14:00:00Z",
            "generation": 14000,
        },
        {
            "publishTime": "2026-01-01T09:00:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 12000,
        },
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2026-01-01T11:00:00Z",
    )

    assert [record["generation"] for record in result] == [12000, 14000]


def test_skips_snapshot_missing_timestamp_fields():
    snapshots = [
        {
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 18000,
        },
        {
            "publishTime": "2026-01-01T09:00:00Z",
            "generation": 19000,
        },
        {
            "publishTime": "2026-01-01T10:00:00Z",
            "startTime": "2026-01-01T12:00:00Z",
            "generation": 19500,
        },
    ]

    result = select_forecast_snapshots(
        snapshots,
        "2026-01-01T11:00:00Z",
    )

    assert len(result) == 1
    assert result[0]["generation"] == 19500
