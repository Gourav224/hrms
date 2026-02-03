import os

from dotenv import load_dotenv

load_dotenv()


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg://", 1)
    if url.startswith("postgresql://") and "+psycopg" not in url:
        return url.replace("postgresql://", "postgresql+psycopg://", 1)
    return url


class Settings:
    def __init__(self) -> None:
        raw_db_url = os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://postgres:postgres@localhost:5432/hrms",
        )
        self.database_url = _normalize_database_url(raw_db_url)
        cors_origins = os.getenv("CORS_ALLOW_ORIGINS", "*")
        self.cors_allow_origins = [origin.strip() for origin in cors_origins.split(",")]
        allowed_hosts = os.getenv("ALLOWED_HOSTS", "*")
        self.allowed_hosts = [host.strip() for host in allowed_hosts.split(",")]
        self.jwt_secret = os.getenv("JWT_SECRET", "change-me")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
        self.bootstrap_token = os.getenv("ADMIN_BOOTSTRAP_TOKEN", "bootstrap-change-me")
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.rate_limit_default = os.getenv("RATE_LIMIT_DEFAULT", "200/minute")
        self.rate_limit_login = os.getenv("RATE_LIMIT_LOGIN", "5/minute")
        self.rate_limit_bootstrap = os.getenv("RATE_LIMIT_BOOTSTRAP", "2/minute")
        self.enable_https_redirect = os.getenv("ENABLE_HTTPS_REDIRECT", "false").lower() == "true"


settings = Settings()
