from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import get_auth_service, get_order_service, require_admin
from app.core.config import get_settings
from app.core.security import create_access_token, get_password_hash
from app.models.enums import OrderStatus, UserRole
from app.models.user import User
from app.schemas.order import OrderRead, OrderStatusUpdate
from app.schemas.token import Token
from app.schemas.user import UserRead
from app.services.auth import AuthService
from app.services.order import OrderService

router = APIRouter()


@router.post("/login", response_model=Token)
async def admin_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service),
) -> Token:
    settings = get_settings()
    if form_data.username == settings.admin_email:
        admin = await auth_service.get_user_by_email(settings.admin_email)
        if admin is None:
            admin = User(
                email=settings.admin_email,
                hashed_password=get_password_hash(settings.admin_password),
                full_name="Администратор",
                role=UserRole.admin,
                is_active=True,
            )
            auth_service.db.add(admin)
        else:
            admin.hashed_password = get_password_hash(settings.admin_password)
            admin.role = UserRole.admin
            admin.is_active = True
        await auth_service.db.commit()
        if form_data.password == settings.admin_password:
            token = create_access_token(subject=admin.email)
            return Token(access_token=token)

    user = await auth_service.authenticate(form_data.username, form_data.password)
    if user is None or user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(subject=user.email)
    return Token(access_token=token)


@router.get("/me", response_model=UserRead)
async def admin_me(current_user: User = Depends(require_admin)) -> User:
    return current_user


@router.get("/orders", response_model=list[OrderRead])
async def list_orders(
    status: OrderStatus | None = None,
    _: User = Depends(require_admin),
    order_service: OrderService = Depends(get_order_service),
) -> list[OrderRead]:
    return await order_service.list_orders(status=status)


@router.patch("/orders/{order_id}/status", response_model=OrderRead)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    _: User = Depends(require_admin),
    order_service: OrderService = Depends(get_order_service),
) -> OrderRead:
    order = await order_service.get_order(order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Заявка не найдена",
        )
    return await order_service.set_status(order, payload.status)
