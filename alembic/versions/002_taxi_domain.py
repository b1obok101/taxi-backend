"""add taxi domain tables

Revision ID: 002
Revises: 001
Create Date: 2026-06-16

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("full_name", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("phone", sa.String(length=32), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "role",
            sa.Enum("passenger", "driver", "admin", name="user_role", native_enum=False),
            nullable=False,
            server_default="passenger",
        ),
    )

    op.create_table(
        "driver_profiles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("car_model", sa.String(length=128), nullable=False),
        sa.Column("car_plate", sa.String(length=32), nullable=False),
        sa.Column("is_online", sa.Boolean(), nullable=False, server_default=sa.text("false")),
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
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("passenger_id", sa.Integer(), nullable=False),
        sa.Column("driver_id", sa.Integer(), nullable=True),
        sa.Column("pickup_address", sa.String(length=512), nullable=False),
        sa.Column("dropoff_address", sa.String(length=512), nullable=False),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "pending",
                "accepted",
                "in_progress",
                "completed",
                "cancelled",
                name="order_status",
                native_enum=False,
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("notes", sa.Text(), nullable=True),
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
        sa.ForeignKeyConstraint(["driver_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["passenger_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_orders_passenger_id"), "orders", ["passenger_id"], unique=False)
    op.create_index(op.f("ix_orders_driver_id"), "orders", ["driver_id"], unique=False)
    op.create_index(op.f("ix_orders_status"), "orders", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_orders_status"), table_name="orders")
    op.drop_index(op.f("ix_orders_driver_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_passenger_id"), table_name="orders")
    op.drop_table("orders")
    op.drop_table("driver_profiles")
    op.drop_column("users", "role")
    op.drop_column("users", "phone")
    op.drop_column("users", "full_name")
