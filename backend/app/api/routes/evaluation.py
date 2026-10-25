
from datetime import date, datetime, time, timedelta, timezone

from fastapi import APIRouter, HTTPException, Query

from app.services.elexon_client import ElexonClient, ElexonAPIError
from app.services.forecast_selection import select_forecast_snapshots
from app.services.metrics import calculate_forecast_metrics

router = APIRouter()


def normalize_timestamp(value: str) -> datetime:
    """Parse a timestamp and normalize it to UTC."""
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        raise ValueError("Timestamp must include a timezone")
    return parsed.astimezone(timezone.utc)


def aggregate_actuals_hourly(actual_records: list[dict]) -> dict[datetime, float]:
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



@router.get("/evaluation/january-2026", tags=["Evaluation"])
async def evaluate_january_2026(
    cutoff_hour_utc: int = Query(default=11, ge=0, le=23),
):
    """Compare hourly wind forecasts with hourly-averaged actual generation."""
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

    # Average each pair of half-hourly actual readings into hourly MW.
    hourly_actuals = aggregate_actuals_hourly(
        [
            record
            for record in actual_records
            if record.get("startTime")
            and datetime(2026, 1, 1, tzinfo=timezone.utc)
            <= normalize_timestamp(record["startTime"])
            < datetime(2026, 2, 1, tzinfo=timezone.utc)
        ]
    )

    # Group forecasts by delivery date and select the latest eligible
    # snapshot published before the previous day's cutoff.
    forecasts_by_date = {}
    for record in forecast_records:
        start_time = record.get("startTime")
        if not start_time:
            continue

        timestamp = normalize_timestamp(start_time)
        if not (
            datetime(2026, 1, 1, tzinfo=timezone.utc)
            <= timestamp
            < datetime(2026, 2, 1, tzinfo=timezone.utc)
        ):
            continue

        forecasts_by_date.setdefault(timestamp.date(), []).append(record)

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

    pairs = []
    for forecast in selected_forecasts:
        timestamp = normalize_timestamp(forecast["startTime"])
        actual_mw = hourly_actuals.get(timestamp)
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

    pairs.sort(key=lambda pair: pair["start_time"])
    metrics = calculate_forecast_metrics(pairs)

    return {
        "period": {"start": "2026-01-01", "end": "2026-01-31"},
        "cutoff_hour_utc": cutoff_hour_utc,
        "actual_half_hourly_interval_count": len(actual_records),
        "hourly_actual_interval_count": len(hourly_actuals),
        "selected_forecast_interval_count": len(selected_forecasts),
        "matched_interval_count": len(pairs),
        "comparison_resolution": "hourly",
        "actual_aggregation": "mean of two half-hourly MW readings",
        "metrics": metrics,
        "intervals": pairs,
    }
