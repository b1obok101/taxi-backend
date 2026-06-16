from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import OrderStatus
from app.models.order import Order
from app.schemas.order import OrderCreate
from app.services.telegram import notify_new_order


class OrderService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def ensure_order_columns(self) -> None:
        await self.db.execute(
            text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS tariff VARCHAR(32)")
        )
        await self.db.execute(
            text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS price_estimate INTEGER")
        )
        await self.db.commit()

    async def create_order(self, order_in: OrderCreate) -> Order:
        await self.ensure_order_columns()
        order = Order(
            customer_name=order_in.customer_name,
            customer_phone=order_in.customer_phone,
            pickup_address=order_in.pickup_address,
            dropoff_address=order_in.dropoff_address,
            tariff=order_in.tariff,
            price_estimate=order_in.price_estimate,
            scheduled_time=order_in.scheduled_time,
            comment=order_in.comment,
            status=OrderStatus.new,
        )
        self.db.add(order)
        await self.db.commit()
        await self.db.refresh(order)
        await notify_new_order(order)
        return order

    async def get_order(self, order_id: int) -> Order | None:
        await self.ensure_order_columns()
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        return result.scalar_one_or_none()

    async def list_orders(self, status: OrderStatus | None = None) -> list[Order]:
        await self.ensure_order_columns()
        query = select(Order).order_by(Order.created_at.desc())
        if status is not None:
            query = query.where(Order.status == status)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def set_status(self, order: Order, status: OrderStatus) -> Order:
        order.status = status
        await self.db.commit()
        await self.db.refresh(order)
        return order
