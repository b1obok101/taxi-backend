from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import OrderStatus, UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    phone: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=6)
    role: UserRole = UserRole.passenger


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: UserRole
    is_active: bool
