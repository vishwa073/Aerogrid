
from datetime import datetime, time, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query

from app.services.elexon_client import ElexonAPIError, ElexonClient
from app.services.forecast_selection import select_forecast_snapshots
from app.services.metrics import calculate_forecast_metrics

router = APIRouter()


def normalize_timestamp(value: str) -> datetime:
    """Parse a timestamp and normalize it to UTC."""
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))

    if parsed.tzinfo is None:
        raise ValueError("Timestamp must include a timezone")

    return parsed.astimezone(timezone.utc)


def filter_january_records(records: list[dict]) -> list[dict]:
    """Keep records whose delivery timestamp falls within January 2026 UTC."""
    start = datetime(2026, 1, 1, tzinfo=timezone.utc)
    end = datetime(2026, 2, 1, tzinfo=timezone.utc)

    return [
        record
        for record in records
        if record.get("startTime")
        and start <= normalize_timestamp(record["startTime"]) < end
    ]


def aggregate_actuals_hourly(
    actual_records: list[dict],
) -> dict[datetime, float]:
    """Average two half-hourly MW readings into one hourly MW value."""
    readings_by_hour: dict[datetime, list[float]] = {}

    for record in actual_records:
        start_time = record.get("startTime")
        generation = record.get("generation")

        if start_time is None or generation is None:
            continue

        timestamp = normalize_timestamp(start_time)
        hour = timestamp.replace(minute=0, second=0, microsecond=0)

        readings_by_hour.setdefault(hour, []).append(float(generation))

    return {
        hour: sum(readings) / 2
        for hour, readings in readings_by_hour.items()
        if len(readings) == 2
    }


def select_day_ahead_forecasts(
    forecast_records: list[dict],
    cutoff_hour_utc: int,
) -> list[dict]:
    """Select the latest eligible forecast for each delivery timestamp."""
    forecasts_by_date: dict[object, list[dict]] = {}

    for record in filter_january_records(forecast_records):
        delivery_time = normalize_timestamp(record["startTime"])
        forecasts_by_date.setdefault(delivery_time.date(), []).append(record)

    selected_forecasts = []

    for delivery_date, records in sorted(forecasts_by_date.items()):
        cutoff = datetime.combine(
            delivery_date - timedelta(days=1),
            time(hour=cutoff_hour_utc),
            tzinfo=timezone.utc,
        )

        selected_forecasts.extend(
            select_forecast_snapshots(records, cutoff)
        )

    return selected_forecasts


def build_matched_pairs(
    forecasts: list[dict],
    actuals: dict[datetime, float],
) -> list[dict]:
    """Match forecast records to actuals using exact UTC timestamps."""
    pairs = []

    for forecast in forecasts:
        timestamp = normalize_timestamp(forecast["startTime"])
        actual_mw = actuals.get(timestamp)
        forecast_mw = forecast.get("generation")

        if actual_mw is None or forecast_mw is None:
            continue

        pairs.append(
            {
                "start_time": timestamp.isoformat().replace("+00:00", "Z"),
                "actual_mw": actual_mw,
                "forecast_mw": float(forecast_mw),
            }
        )

    return sorted(pairs, key=lambda pair: pair["start_time"])


@router.get("/evaluation/january-2026", tags=["Evaluation"])
async def evaluate_january_2026(
    cutoff_hour_utc: int = Query(default=11, ge=0, le=23),
):
    """Compare hourly wind forecasts with hourly actual generation."""
    try:
        client = ElexonClient()

        actual_records = await client.fetch_actual_generation(
            {
                "settlementDateFrom": "2026-01-01",
                "settlementDateTo": "2026-01-31",
                "fuelType": "WIND",
            }
        )

        forecast_records = await client.fetch_wind_forecasts(
            {
                "publishDateTimeFrom": "2025-12-30T00:00:00Z",
                "publishDateTimeTo": "2026-01-31T23:59:59Z",
            }
        )

    except ElexonAPIError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to retrieve Elexon data: {exc}",
        ) from exc

    january_actual_records = filter_january_records(actual_records)
    hourly_actuals = aggregate_actuals_hourly(january_actual_records)

    selected_forecasts = select_day_ahead_forecasts(
        forecast_records,
        cutoff_hour_utc,
    )

    hourly_pairs = build_matched_pairs(
        selected_forecasts,
        hourly_actuals,
    )

    hourly_metrics = calculate_forecast_metrics(
        hourly_pairs,
        interval_hours=1.0,
    )

    return {
        "period": {
            "start": "2026-01-01",
            "end": "2026-01-31",
        },
        "cutoff_hour_utc": cutoff_hour_utc,
        "actual_half_hourly_interval_count": len(january_actual_records),
        "hourly_actual_interval_count": len(hourly_actuals),
        "selected_forecast_interval_count": len(selected_forecasts),
        "matched_interval_count": len(hourly_pairs),
        "comparison_resolution": "hourly",
        "actual_aggregation": "mean of two half-hourly MW readings",
        "metrics": hourly_metrics,
        "intervals": hourly_pairs,
    }
