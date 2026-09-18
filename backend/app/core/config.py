from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        extra="ignore",
    )

    # --- Project Metadata ---
    PROJECT_NAME: str = "Hermit Edge: AI Medical Research"
    VERSION: str = "1.1.0-secure"

    # --- Hermit Gateway: Financial Safety ---
    # Upstash Redis is CRITICAL for preventing billing runaways on serverless
    UPSTASH_REDIS_REST_URL: str = ""
    UPSTASH_REDIS_REST_TOKEN: str = ""

    # HARD KILL SWITCH: If monthly spend exceeds this, the API refuses to generate
    # Value is in USD. Keeps you safe during demos.

    # DoS Protection: Max requests per minute per IP (approximate)
    GLOBAL_RATE_LIMIT_PER_MINUTE: int = 10

    # --- PubMed (NCBI E-Utilities) ---
    # Strict limit on articles fetched to keep context window small and costs low
    PUBMED_API_KEY: str = ""
    PUBMED_EMAIL: str = ""

    # --- LLM Service ---
    TOGETHER_API_KEY: str = ""
    LLM_MODEL_ID: str = "Qwen/Qwen3.8-Flash"

    # Bound generation cost and runaway output.
    LLM_MAX_TOKENS: int = 2048

    # --- Frontend CORS ---
    # Comma-separated list of allowed origins
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

# Instantiate once
settings = Settings()
