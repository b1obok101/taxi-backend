import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.api.routes import health
from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.models.enums import UserRole
from app.models.user import User
from app.services.auth import AuthService

logger = logging.getLogger(__name__)


async def ensure_admin_user() -> None:
    settings = get_settings()
    async with AsyncSessionLocal() as session:
        auth_service = AuthService(session)
        existing = await auth_service.get_user_by_email(settings.admin_email)
        if existing is not None:
            existing.hashed_password = get_password_hash(settings.admin_password)
            existing.role = UserRole.admin
            existing.is_active = True
            await session.commit()
            logger.info("Обновлён администратор по умолчанию: %s", settings.admin_email)
            return
        # Создаём напрямую, минуя строгую валидацию EmailStr
        # (она режет служебные домены вроде .local).
        admin = User(
            email=settings.admin_email,
            hashed_password=get_password_hash(settings.admin_password),
            full_name="Администратор",
            role=UserRole.admin,
            is_active=True,
        )
        session.add(admin)
        await session.commit()
        logger.info("Создан администратор по умолчанию: %s", settings.admin_email)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await ensure_admin_user()
    except Exception as exc:  # noqa: BLE001 — старт не должен падать из-за сидинга
        logger.warning("Не удалось создать администратора при старте: %s", exc)
    yield


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, tags=["health"])
    app.include_router(api_router, prefix=settings.api_v1_prefix)

    return app


app = create_app()
