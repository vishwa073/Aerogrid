"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-24 07:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create actual_generation table
    op.create_table(
        "actual_generation",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("dataset", sa.String(length=16), server_default="FUELHH", nullable=False),
        sa.Column("fuel_type", sa.String(length=32), server_default="WIND", nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("settlement_date", sa.Date(), nullable=False),
        sa.Column("settlement_period", sa.Integer(), nullable=False),
        sa.Column("publish_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("generation_mw", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("start_time", "fuel_type", name="uq_actual_start_fuel"),
    )
    op.create_index("ix_actual_generation_start_time", "actual_generation", ["start_time"])
    op.create_index("ix_actual_generation_settlement_date", "actual_generation", ["settlement_date"])
    op.create_index("ix_actual_generation_fuel_type", "actual_generation", ["fuel_type"])
    op.create_index("ix_actual_settlement_lookup", "actual_generation", ["settlement_date", "settlement_period"])

    # 2. Create wind_forecast table
    op.create_table(
        "wind_forecast",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("dataset", sa.String(length=16), server_default="WINDFOR", nullable=False),
        sa.Column("publish_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("generation_mw", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("publish_time", "start_time", name="uq_wind_forecast_publish_start"),
    )
    op.create_index("ix_wind_forecast_publish_time", "wind_forecast", ["publish_time"])
    op.create_index("ix_wind_forecast_start_time", "wind_forecast", ["start_time"])
    op.create_index("ix_wind_forecast_start_publish", "wind_forecast", ["start_time", "publish_time"])


def downgrade() -> None:
    op.drop_table("wind_forecast")
    op.drop_table("actual_generation")
