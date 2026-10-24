from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.api.routes import api_router
from app.api.routes.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events."""
    logger.info("Starting up %s v%s in %s mode", settings.PROJECT_NAME, settings.VERSION, settings.ENVIRONMENT)
    yield
    logger.info("Shutting down %s", settings.PROJECT_NAME)


def create_application() -> FastAPI:
    """Factory function for creating the AeroGrid FastAPI application."""
    app = FastAPI(
        title=f"{settings.PROJECT_NAME} API",
        version=settings.VERSION,
        description=(
            "AeroGrid Wind Forecast Intelligence Dashboard Backend API. "
            "Evaluates day-ahead wind generation forecasts against actual Elexon outturns."
        ),
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
    )

    # Configure Cross-Origin Resource Sharing (CORS)
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Direct top-level health endpoint (e.g. for container health checks)
    app.include_router(health_router, prefix="", tags=["Health"])

    # Versioned API routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_application()
