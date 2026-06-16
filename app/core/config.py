from functools import lru_cache
from typing import Literal

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "Taxi Service API"
    app_env: Literal["development", "staging", "production"] = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    host: str = "0.0.0.0"
    port: int = 8000

    postgres_user: str = "taxi"
    postgres_password: str = "taxi_secret"
    postgres_db: str = "taxi_db"
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    database_url: PostgresDsn | None = None

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30

    cors_origins: str = "http://localhost:3000"

    @field_validator("database_url", mode="before")
    @classmethod
    def assemble_db_connection(cls, value: str | None, info) -> str:
        if value:
            return value
        data = info.data
        return (
            f"postgresql+asyncpg://{data['postgres_user']}:{data['postgres_password']}"
            f"@{data['postgres_host']}:{data['postgres_port']}/{data['postgres_db']}"
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
