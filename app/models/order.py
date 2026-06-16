from sqlalchemy import Enum, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel
from app.models.enums import OrderStatus


class Order(BaseModel):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_phone: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    pickup_address: Mapped[str] = mapped_column(String(512), nullable=False)
    dropoff_address: Mapped[str] = mapped_column(String(512), nullable=False)
    tariff: Mapped[str | None] = mapped_column(String(32), nullable=True)
    price_estimate: Mapped[int | None] = mapped_column(Integer, nullable=True)
    scheduled_time: Mapped[str | None] = mapped_column(String(64), nullable=True)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status", native_enum=False),
        default=OrderStatus.new,
        nullable=False,
        index=True,
    )
