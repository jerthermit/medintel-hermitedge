from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.models.llm import SynthesisRequest
from app.services.llm_service import stream_summarize_results
from app.core.dependencies import check_hermit_gate

router = APIRouter()

@router.post("/synthesize")
async def generate_synthesis(
    request: SynthesisRequest,
    # The Gatekeeper:
    # 1. Checks Global Rate Limits
    # 2. Checks Monthly Budget
    safety_check: None = Depends(check_hermit_gate)
):
    """
    Generates a 'Principal Investigator' grade synthesis of the provided articles.

    Architecture:
    - Server-Sent Token Streaming via FastAPI StreamingResponse
    - Configured Together AI model
    - Sub-1-second Time-To-First-Token (TTFT)

    Flow:
    1. Validate Payload (Max 10 articles)
    2. Check Security/Budget Gate
    3. Stream raw token bytes directly to the client as they arrive
    """
    try:
        # FastAPI's StreamingResponse natively supports synchronous generators.
        # It automatically runs the generator in a worker thread to prevent
        # blocking the main asyncio event loop.
        # We use text/plain so the frontend fetch reader can easily decode the raw chunks.
        return StreamingResponse(
            stream_summarize_results(request.query, request.articles),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"  # Disables buffering in proxies like Nginx/Vite
            }
        )

    except Exception:
        # Note: Because it is a stream, exceptions *during* token generation
        # are safely caught in the service layer and yielded as text chunks.
        # This catch block only triggers if the stream fails to initialize.
        raise HTTPException(
            status_code=500,
            detail="The synthesis engine failed to initialize the stream. Please try again."
        )
