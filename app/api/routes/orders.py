from fastapi import APIRouter, Depends

from app.api.deps import get_order_service
from app.schemas.order import OrderCreate, OrderRead
from app.services.order import OrderService

router = APIRouter()


@router.post("", response_model=OrderRead, status_code=201)
async def create_order(
    order_in: OrderCreate,
    order_service: OrderService = Depends(get_order_service),
) -> OrderRead:
    return await order_service.create_order(order_in)
