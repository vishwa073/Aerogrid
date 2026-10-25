import pytest

from app.services.metrics import calculate_forecast_metrics


def test_calculates_accuracy_metrics():
    pairs = [
        {"actual_mw": 100, "forecast_mw": 90},
        {"actual_mw": 80, "forecast_mw": 100},
    ]

    result = calculate_forecast_metrics(pairs, interval_hours=0.5)

    assert result["interval_count"] == 2
    assert result["mae_mw"] == pytest.approx(15.0)
    assert result["rmse_mw"] == pytest.approx((250**0.5))
    assert result["bias_mw"] == pytest.approx(-5.0)
    assert result["shortfall_energy_mwh"] == pytest.approx(10.0)


def test_returns_empty_metrics_when_no_valid_pairs():
    result = calculate_forecast_metrics([])

    assert result == {
        "interval_count": 0,
        "mae_mw": None,
        "rmse_mw": None,
        "bias_mw": None,
        "shortfall_energy_mwh": None,
    }


def test_ignores_pairs_with_missing_values():
    pairs = [
        {"actual_mw": 100, "forecast_mw": 90},
        {"actual_mw": None, "forecast_mw": 80},
        {"actual_mw": 70, "forecast_mw": None},
    ]

    result = calculate_forecast_metrics(pairs)

    assert result["interval_count"] == 1
    assert result["mae_mw"] == pytest.approx(10.0)
    assert result["bias_mw"] == pytest.approx(10.0)
    assert result["shortfall_energy_mwh"] == pytest.approx(0.0)