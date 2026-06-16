"""add tariff and price_estimate to orders

Revision ID: 004
Revises: 003
Create Date: 2026-06-16

"""
from typing import Sequence, Union

from alembic import op

revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS tariff VARCHAR(32)")
    op.execute("ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_estimate INTEGER")


def downgrade() -> None:
    op.execute("ALTER TABLE orders DROP COLUMN IF EXISTS price_estimate")
    op.execute("ALTER TABLE orders DROP COLUMN IF EXISTS tariff")
