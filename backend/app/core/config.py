
from typing import List, Optional, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


class Settings(BaseSettings):
    """
    AeroGrid Backend Application Settings.
    Loaded from environment variables and/or .env file.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "AeroGrid"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # CORS configuration
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls, v: Union[str, List[str]]
    ) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    # Elexon Insights Solution REST API upstream endpoint
    ELEXON_API_BASE_URL: str = "https://data.elexon.co.uk/bmrs/api/v1"
    ELEXON_HTTP_TIMEOUT_SECONDS: float = 30.0

    # Decision cutoff time configuration.
    # 11:00 UTC is a provisional assumption that must be verified.
    DEFAULT_DECISION_CUTOFF_TIME: str = "11:00"

    # PostgreSQL database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "aerogrid_user"
    POSTGRES_PASSWORD: str = "aerogrid_pass"
    POSTGRES_DB: str = "aerogrid_db"
    DATABASE_URL: Optional[str] = None

    @property
    def async_database_url(self) -> str:
        """
        Return a SQLAlchemy asyncpg URL.
        Adapt PostgreSQL SSL query parameters for asyncpg.
        """
        if self.DATABASE_URL:
            url = self.DATABASE_URL

            if url.startswith("postgresql://"):
                url = url.replace(
                    "postgresql://",
                    "postgresql+asyncpg://",
                    1,
                )

            parsed_url = make_url(url)
            query = dict(parsed_url.query)

            # asyncpg uses 'ssl', not libpq's 'sslmode'.
            if "sslmode" in query:
                query["ssl"] = query.pop("sslmode")

            # channel_binding is not needed for this connection setup.
            query.pop("channel_binding", None)

            parsed_url = parsed_url.set(query=query)

            return parsed_url.render_as_string(hide_password=False)

        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/"
            f"{self.POSTGRES_DB}"
        )

    @property
    def sync_database_url(self) -> str:
        """Return a standard synchronous PostgreSQL connection URL."""
        if self.DATABASE_URL:
            url = self.DATABASE_URL

            if url.startswith("postgresql+asyncpg://"):
                return url.replace(
                    "postgresql+asyncpg://",
                    "postgresql://",
                    1,
                )

            return url

        return (
            f"postgresql://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/"
            f"{self.POSTGRES_DB}"
        )


settings = Settings()
