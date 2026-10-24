from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for AeroGrid API health check response."""
    status: str = Field(default="healthy", description="Application health status")
    app: str = Field(default="AeroGrid", description="Application service name")
    version: str = Field(description="Application version string")
    environment: str = Field(description="Current deployment environment")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Current server timestamp in UTC"
    )
