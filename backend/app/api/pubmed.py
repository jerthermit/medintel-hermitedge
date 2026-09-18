# File: backend/app/api/pubmed.py

import logging

from fastapi import APIRouter, Depends, HTTPException
from starlette.concurrency import run_in_threadpool
from app.models.research import ResearchRequest, ResearchResponse
from app.services.pubmed_service import search_articles
from app.core.dependencies import check_hermit_gate

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/search", response_model=ResearchResponse)
async def search_pubmed(
    request: ResearchRequest,
    # The Gatekeeper:
    # 1. Checks if Global Rate Limit (DoS) is exceeded
    # 2. Checks if Monthly Budget (Kill Switch) is exceeded
    # If Upstash is down, it fails open (logs warning) to keep demo alive.
    safety_check: None = Depends(check_hermit_gate)
):
    """
    Retrieves the latest medical evidence from PubMed.

    Flow:
    1. Validate Input (min 3 chars)
    2. Check Security/Budget Gate
    3. Call PubMed Service (with hard timeouts)
    4. Return Structured Data
    """
    try:
        # Service handles fetching, cleaning, and timeouts
        # PubMed calls are IO-bound, so we must run in a threadpool to avoid blocking the event loop
        articles = await run_in_threadpool(search_articles, request.query, request.limit)
        return ResearchResponse(query=request.query, results=articles)

    except Exception:
        logger.error("Unexpected PubMed search failure.", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="The PubMed search could not be completed.",
        )
