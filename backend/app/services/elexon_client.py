
from typing import Any, Mapping

import httpx

from app.core.config import settings


class ElexonAPIError(Exception):
    """Raised when an Elexon API request or response is invalid."""


class ElexonClient:
    """Read-only asynchronous client for Elexon's BMRS API."""

    def __init__(
        self,
        base_url: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        self.base_url = (
            base_url or settings.ELEXON_API_BASE_URL
        ).rstrip("/")
        self.timeout_seconds = (
            timeout_seconds
            if timeout_seconds is not None
            else settings.ELEXON_HTTP_TIMEOUT_SECONDS
        )

    async def _fetch_records(
        self,
        endpoint: str,
        params: Mapping[str, Any],
    ) -> list[dict[str, Any]]:
        """Fetch JSON records and validate their basic structure."""
        url = f"{self.base_url}/{endpoint.lstrip('/')}"

        try:
            async with httpx.AsyncClient(
                timeout=self.timeout_seconds
            ) as client:
                response = await client.get(url, params=dict(params))
                response.raise_for_status()
                payload = response.json()

        except httpx.TimeoutException as exc:
            raise ElexonAPIError(
                f"Elexon request timed out for {endpoint}"
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise ElexonAPIError(
                f"Elexon returned HTTP {exc.response.status_code} "
                f"for {endpoint}"
            ) from exc
        except httpx.RequestError as exc:
            raise ElexonAPIError(
                f"Could not connect to Elexon for {endpoint}"
            ) from exc
        except ValueError as exc:
            raise ElexonAPIError(
                f"Elexon returned invalid JSON for {endpoint}"
            ) from exc

        if isinstance(payload, dict):
            payload = payload.get("data")

        if not isinstance(payload, list):
            raise ElexonAPIError(
                f"Unexpected response structure from {endpoint}"
            )

        if not all(isinstance(record, dict) for record in payload):
            raise ElexonAPIError(
                f"Response from {endpoint} contains invalid records"
            )

        return payload

    async def fetch_actual_generation(
        self,
        params: Mapping[str, Any],
    ) -> list[dict[str, Any]]:
        """Fetch FUELHH actual-generation records."""
        return await self._fetch_records(
            "datasets/FUELHH/stream",
            params,
        )

    async def fetch_wind_forecasts(
        self,
        params: Mapping[str, Any],
    ) -> list[dict[str, Any]]:
        """Fetch WINDFOR wind-forecast records."""
        return await self._fetch_records(
            "datasets/WINDFOR/stream",
            params,
        )
    
    async def fetch_wind_forecast_evolution(
        self,
        start_time: str,
    ) -> list[dict[str, Any]]:
        """Fetch historical forecast snapshots for one delivery interval."""
        return await self._fetch_records(
            "forecast/generation/wind/evolution",
            {"startTime": start_time},
        )
