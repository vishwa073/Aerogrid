from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    AeroGrid Backend Application Settings.
    Loaded from environment variables and/or .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
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
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return []

    # Elexon Insights Solution REST API upstream endpoint
    ELEXON_API_BASE_URL: str = "https://data.elexon.co.uk/bmrs/api/v1"
    ELEXON_HTTP_TIMEOUT_SECONDS: float = 30.0

    # Decision cutoff time configuration:
    # NOTE: In Phase 1, 11:00 UTC is treated as a provisional trading assumption (aligned
    # with EPEX SPOT GB Day-Ahead auction order book closure), NOT an established official
    # fact. It is isolated here so it can be verified or reconfigured without rewriting
    # the application.
    DEFAULT_DECISION_CUTOFF_TIME: str = "11:00"


settings = Settings()
