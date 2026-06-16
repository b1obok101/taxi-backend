import enum


class UserRole(str, enum.Enum):
    passenger = "passenger"
    driver = "driver"
    admin = "admin"


class OrderStatus(str, enum.Enum):
    new = "new"
    processing = "processing"
    done = "done"
    cancelled = "cancelled"
