"""AeroGrid API route definitions."""

from fastapi import APIRouter

from app.api.routes.health import router as health_router
from app.api.routes.evaluation import router as evaluation_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["Health"])
api_router.include_router(evaluation_router, tags=["Evaluation"])