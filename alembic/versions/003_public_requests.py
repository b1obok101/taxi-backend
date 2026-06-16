"""rework orders into public requests and drop driver tables

Revision ID: 003
Revises: 002
Create Date: 2026-06-16

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table("orders")
    op.drop_table("driver_profiles")

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("customer_name", sa.String(length=255), nullable=False),
        sa.Column("customer_phone", sa.String(length=32), nullable=False),
        sa.Column("pickup_address", sa.String(length=512), nullable=False),
        sa.Column("dropoff_address", sa.String(length=512), nullable=False),
        sa.Column("scheduled_time", sa.String(length=64), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                "new",
                "processing",
                "done",
                "cancelled",
                name="order_status",
                native_enum=False,
            ),
            nullable=False,
            server_default="new",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_orders_customer_phone"), "orders", ["customer_phone"])
    op.create_index(op.f("ix_orders_status"), "orders", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_orders_status"), table_name="orders")
    op.drop_index(op.f("ix_orders_customer_phone"), table_name="orders")
    op.drop_table("orders")
