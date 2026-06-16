from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import OrderStatus


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=255)
    customer_phone: str = Field(min_length=5, max_length=32)
    pickup_address: str = Field(min_length=3, max_length=512)
    dropoff_address: str = Field(min_length=3, max_length=512)
    tariff: str | None = Field(default=None, max_length=32)
    price_estimate: int | None = Field(default=None, ge=0)
    scheduled_time: str | None = Field(default=None, max_length=64)
    comment: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    customer_phone: str
    pickup_address: str
    dropoff_address: str
    tariff: str | None
    price_estimate: int | None
    scheduled_time: str | None
    comment: str | None
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
