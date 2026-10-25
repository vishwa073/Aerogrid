from datetime import datetime, timezone
from typing import Any, Mapping


def _parse_utc(value: str | datetime) -> datetime:
    """Parse a timestamp and normalize it to UTC."""
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace("Z", "+00:00"))

    if value.tzinfo is None:
        raise ValueError("Timestamp must include a timezone")

    return value.astimezone(timezone.utc)


def select_forecast_snapshots(
    snapshots: list[Mapping[str, Any]],
    cutoff: str | datetime,
) -> list[dict[str, Any]]:
    """
    Select the latest eligible forecast snapshot per delivery interval.

    A snapshot is eligible when publishTime <= cutoff.
    Intervals with no eligible snapshot are omitted, not filled with zero.
    """
    cutoff_time = _parse_utc(cutoff)
    selected: dict[str, dict[str, Any]] = {}
    selected_publish_times: dict[str, datetime] = {}

    for snapshot in snapshots:
        start_time = snapshot.get("startTime")
        publish_time = snapshot.get("publishTime")

        if not start_time or not publish_time:
            raise ValueError(
                "Each forecast snapshot must contain startTime and publishTime"
            )

        parsed_start_time = _parse_utc(start_time)
        parsed_publish_time = _parse_utc(publish_time)

        if parsed_publish_time > cutoff_time:
            continue

        # Normalize the delivery interval to a consistent UTC key.
        start_key = parsed_start_time.isoformat()

        previous_publish_time = selected_publish_times.get(start_key)

        if (
            previous_publish_time is None
            or parsed_publish_time > previous_publish_time
        ):
            selected[start_key] = dict(snapshot)
            selected_publish_times[start_key] = parsed_publish_time

    return sorted(
        selected.values(),
        key=lambda record: _parse_utc(record["startTime"]),
    )