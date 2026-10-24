"""AeroGrid database models export."""
from app.db.base import Base
from app.models.generation import ActualGeneration, WindForecast

__all__ = ["Base", "ActualGeneration", "WindForecast"]
