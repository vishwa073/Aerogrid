from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import check_database_health
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="AeroGrid Liveness Check")
async def get_health() -> HealthResponse:
    """
    Liveness check: returns 200 OK to indicate the application process is running.
    Non-blockingly checks database status and reports it in the payload without
    failing the liveness probe if PostgreSQL is temporarily unavailable.
    """
    is_db_connected, db_status = await check_database_health()
    return HealthResponse(
        status="healthy",
        app=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        database=db_status,
    )


@router.get("/health/ready", summary="AeroGrid Readiness Check")
async def get_readiness():
    """
    Readiness check: returns 200 OK when both application and database are ready
    to accept traffic. Returns 503 Service Unavailable if database is unreachable.
    """
    is_db_connected, db_status = await check_database_health()
    if not is_db_connected:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "app": settings.PROJECT_NAME,
                "database": db_status,
                "detail": "Database connection check failed",
            },
        )
    return {
        "status": "ready",
        "app": settings.PROJECT_NAME,
        "database": db_status,
    }
