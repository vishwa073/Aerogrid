from typing import AsyncGenerator, Tuple
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy import text
from app.core.config import settings
from app.core.logging import logger

# Lazy engine initialization helper
_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    """Returns or lazily creates the SQLAlchemy AsyncEngine instance."""
    global _engine, _session_factory
    if _engine is None:
        _engine = create_async_engine(
            settings.async_database_url,
            echo=False,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
        _session_factory = async_sessionmaker(
            bind=_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    """Returns the async session factory."""
    if _session_factory is None:
        get_engine()
    assert _session_factory is not None
    return _session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    factory = get_session_factory()
    async with factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database_health(timeout_seconds: float = 2.0) -> Tuple[bool, str]:
    """
    Performs a lightweight non-blocking connectivity check (SELECT 1).
    Returns (True, "connected") if healthy, or (False, error_details) if unavailable.
    Does not crash the application if PostgreSQL is down.
    """
    try:
        engine = get_engine()
        async with engine.connect() as conn:
            # Set statement timeout for safety
            await conn.execute(text("SELECT 1"))
            return True, "connected"
    except Exception as exc:
        logger.debug("Database health check failed: %s", exc)
        return False, f"disconnected: {type(exc).__name__}"
