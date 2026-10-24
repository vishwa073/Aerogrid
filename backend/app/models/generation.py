
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    DateTime,
    Float,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)

from app.db.base import Base


class ActualGeneration(Base):
    """
    Half-hourly generation outturn by fuel type (Elexon FUELHH stream).
    Represents actual operational outturns for Great Britain.
    """

    __tablename__ = "actual_generation"

    # BIGINT in PostgreSQL, INTEGER in SQLite for automatic ID generation.
    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
    )

    dataset = Column(String(16), nullable=False, default="FUELHH")
    fuel_type = Column(String(32), nullable=False, default="WIND", index=True)

    # Delivery interval timestamps (UTC)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    settlement_date = Column(Date, nullable=False, index=True)
    settlement_period = Column(Integer, nullable=False)

    # Publication timestamp from Elexon
    publish_time = Column(DateTime(timezone=True), nullable=False)

    # Average generation outturn over the 30-minute period (MW)
    generation_mw = Column(Float, nullable=False)

    # Audit timestamp
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        # Prevent duplicate entries for the same fuel type and delivery half-hour
        UniqueConstraint("start_time", "fuel_type", name="uq_actual_start_fuel"),
        Index(
            "ix_actual_settlement_lookup",
            "settlement_date",
            "settlement_period",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<ActualGeneration(fuel={self.fuel_type}, "
            f"start={self.start_time.isoformat() if self.start_time else None}, "
            f"mw={self.generation_mw})>"
        )


class WindForecast(Base):
    """
    Wind generation forecasts (Elexon WINDFOR stream).
    Preserves multiple forecast releases (publish_time) for each delivery interval (start_time),
    enabling historical day-ahead cutoff evaluation without hindsight bias.
    """

    __tablename__ = "wind_forecast"

    # BIGINT in PostgreSQL, INTEGER in SQLite for automatic ID generation.
    id = Column(
        BigInteger().with_variant(Integer, "sqlite"),
        primary_key=True,
        autoincrement=True,
    )

    dataset = Column(String(16), nullable=False, default="WINDFOR")

    # When National Grid ESO published this forecast snapshot (UTC)
    publish_time = Column(DateTime(timezone=True), nullable=False, index=True)

    # Target delivery interval start timestamp (UTC)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)

    # Forecasted wind generation value (MW)
    generation_mw = Column(Float, nullable=False)

    # Audit timestamp
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    __table_args__ = (
        # A single forecast publication release contains at most one value per delivery interval
        UniqueConstraint(
            "publish_time",
            "start_time",
            name="uq_wind_forecast_publish_start",
        ),
        # High-performance composite index for day-ahead cutoff queries:
        # Given start_time, find the latest publish_time <= cutoff
        Index(
            "ix_wind_forecast_start_publish",
            "start_time",
            "publish_time",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<WindForecast(published={self.publish_time.isoformat() if self.publish_time else None}, "
            f"delivery={self.start_time.isoformat() if self.start_time else None}, "
            f"mw={self.generation_mw})>"
        )
