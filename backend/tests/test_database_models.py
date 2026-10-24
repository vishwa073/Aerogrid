"""
Unit tests for AeroGrid database models and constraints.
Uses an isolated in-memory SQLite database to verify SQLAlchemy 2.x
schema constraints, multi-snapshot forecast storage, and uniqueness.
All test records are explicitly synthetic fixtures.
"""
from datetime import date, datetime, timezone
import pytest
import pytest_asyncio
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.db.base import Base
from app.models.generation import ActualGeneration, WindForecast


@pytest_asyncio.fixture
async def test_db_session():
    """Provides an isolated in-memory SQLite async test session."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_actual_generation_insert_and_unique_constraint(test_db_session: AsyncSession):
    """
    Verifies that ActualGeneration records can be stored and that duplicate
    (start_time, fuel_type) records are strictly rejected by uniqueness constraints.
    """
    synthetic_delivery_start = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)
    
    # 1. Insert valid synthetic record
    record1 = ActualGeneration(
        dataset="FUELHH",
        fuel_type="WIND",
        start_time=synthetic_delivery_start,
        settlement_date=date(2026, 1, 1),
        settlement_period=1,
        publish_time=datetime(2026, 1, 1, 0, 30, tzinfo=timezone.utc),
        generation_mw=13500.0,
    )
    test_db_session.add(record1)
    await test_db_session.commit()

    # Verify query
    result = await test_db_session.execute(
        select(ActualGeneration).where(ActualGeneration.start_time == synthetic_delivery_start)
    )
    saved = result.scalar_one_or_none()
    assert saved is not None
    assert saved.generation_mw == 13500.0

    # 2. Attempt duplicate insert with same start_time and fuel_type
    duplicate = ActualGeneration(
        dataset="FUELHH",
        fuel_type="WIND",
        start_time=synthetic_delivery_start,
        settlement_date=date(2026, 1, 1),
        settlement_period=1,
        publish_time=datetime(2026, 1, 1, 0, 45, tzinfo=timezone.utc),
        generation_mw=13600.0,
    )
    test_db_session.add(duplicate)
    with pytest.raises(IntegrityError):
        await test_db_session.commit()
    await test_db_session.rollback()


@pytest.mark.asyncio
async def test_wind_forecast_preserves_multiple_publish_snapshots(test_db_session: AsyncSession):
    """
    Verifies that the database correctly retains MULTIPLE forecast snapshots (different publish_time)
    for the exact same delivery interval (start_time). This is critical for evaluating
    day-ahead decision cutoffs without overwriting earlier forecasts.
    """
    target_delivery = datetime(2026, 1, 2, 12, 0, tzinfo=timezone.utc)
    
    # Snapshot A: Published D-1 at 09:30 UTC
    snapshot_a = WindForecast(
        dataset="WINDFOR",
        publish_time=datetime(2026, 1, 1, 9, 30, tzinfo=timezone.utc),
        start_time=target_delivery,
        generation_mw=14200.0,
    )
    # Snapshot B: Published D-1 at 15:30 UTC (later revision)
    snapshot_b = WindForecast(
        dataset="WINDFOR",
        publish_time=datetime(2026, 1, 1, 15, 30, tzinfo=timezone.utc),
        start_time=target_delivery,
        generation_mw=15100.0,
    )

    test_db_session.add_all([snapshot_a, snapshot_b])
    await test_db_session.commit()

    # Query all forecasts for this delivery interval
    result = await test_db_session.execute(
        select(WindForecast)
        .where(WindForecast.start_time == target_delivery)
        .order_by(WindForecast.publish_time.asc())
    )
    forecasts = result.scalars().all()
    assert len(forecasts) == 2
    assert forecasts[0].generation_mw == 14200.0
    assert forecasts[1].generation_mw == 15100.0

    # Verify duplicate (publish_time, start_time) is rejected
    duplicate_snapshot = WindForecast(
        dataset="WINDFOR",
        publish_time=datetime(2026, 1, 1, 9, 30, tzinfo=timezone.utc),
        start_time=target_delivery,
        generation_mw=99999.0,
    )
    test_db_session.add(duplicate_snapshot)
    with pytest.raises(IntegrityError):
        await test_db_session.commit()
    await test_db_session.rollback()
