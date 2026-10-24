from fastapi import APIRouter
from app.core.config import settings
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="AeroGrid Health Check")
async def get_health() -> HealthResponse:
    """
    Returns the health status, environment, and current UTC timestamp
    of the AeroGrid backend service.
    """
    return HealthResponse(
        status="healthy",
        app=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )
