
from math import sqrt
from typing import Any


def calculate_forecast_metrics(
    pairs: list[dict[str, Any]],
    interval_hours: float = 1.0,
) -> dict[str, Any]:
    """
    Calculate wind forecast accuracy using matched actual and forecast intervals.

    Each pair must contain:
      - actual_mw: measured wind generation in MW
      - forecast_mw: forecast wind generation in MW

    Args:
        pairs: Matched actual and forecast intervals.
        interval_hours: Duration of each interval in hours.
            Use 1.0 for hourly data and 0.5 for half-hourly data.

    Missing intervals should be excluded before calling this function,
    not represented as zero.
    """
    if interval_hours <= 0:
        raise ValueError("interval_hours must be greater than zero")

    valid_pairs = [
        pair
        for pair in pairs
        if pair.get("actual_mw") is not None
        and pair.get("forecast_mw") is not None
    ]

    if not valid_pairs:
        return {
            "interval_count": 0,
            "mae_mw": None,
            "rmse_mw": None,
            "bias_mw": None,
            "shortfall_energy_mwh": None,
        }

    errors = [
        float(pair["actual_mw"]) - float(pair["forecast_mw"])
        for pair in valid_pairs
    ]

    absolute_errors = [abs(error) for error in errors]
    squared_errors = [error**2 for error in errors]

    # A negative error means actual generation was below forecast.
    shortfall_energy_mwh = sum(
        max(-error, 0.0) * interval_hours
        for error in errors
    )

    count = len(errors)

    return {
        "interval_count": count,
        "mae_mw": sum(absolute_errors) / count,
        "rmse_mw": sqrt(sum(squared_errors) / count),
        "bias_mw": sum(errors) / count,
        "shortfall_energy_mwh": shortfall_energy_mwh,
    }
