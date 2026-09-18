# File: backend/app/core/dependencies.py

import logging
from datetime import datetime

import httpx
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)


async def get_redis_client():
    """
    Returns an Upstash Redis REST client when credentials are configured.
    Local development can run without Redis.
    """
    if (
        not settings.UPSTASH_REDIS_REST_URL
        or not settings.UPSTASH_REDIS_REST_TOKEN
    ):
        return None

    base_url = settings.UPSTASH_REDIS_REST_URL

    if not base_url.startswith(("http://", "https://")):
        base_url = f"https://{base_url}"

    return httpx.AsyncClient(
        base_url=base_url,
        headers={
            "Authorization": f"Bearer {settings.UPSTASH_REDIS_REST_TOKEN}"
        },
        timeout=3.0,
    )


async def check_rate_limit(client: httpx.AsyncClient) -> None:
    """
    Enforces the global requests-per-minute limit.

    If Redis is configured but unavailable, fail closed so the public API
    cannot silently lose its traffic protection.
    """
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M")
        key = f"hermit_rate:{timestamp}"

        response = await client.post(f"/incr/{key}")

        if response.status_code != 200:
            raise RuntimeError(
                f"Redis returned HTTP {response.status_code}."
            )

        data = response.json()

        if "error" in data:
            raise RuntimeError("Redis rejected the rate-limit command.")

        current_count = int(data.get("result") or 0)

        if current_count == 1:
            expiry_response = await client.post(
                f"/expire/{key}",
                json=90,
            )

            if expiry_response.status_code != 200:
                logger.warning(
                    "Could not set expiry on Redis rate-limit key."
                )

        if current_count > settings.GLOBAL_RATE_LIMIT_PER_MINUTE:
            raise HTTPException(
                status_code=429,
                detail="Demo traffic limit reached. Please try again in a minute.",
            )

    except HTTPException:
        raise
    except Exception:
        logger.error("Rate-limit protection failed.", exc_info=True)
        raise HTTPException(
            status_code=503,
            detail="Demo protection is temporarily unavailable.",
        )


async def check_hermit_gate():
    """
    Applies Redis-backed traffic protection when Redis is configured.
    """
    client = await get_redis_client()

    if not client:
        return

    async with client:
        await check_rate_limit(client)
