# File: backend/app/models/llm.py

from typing import List
from pydantic import BaseModel, Field
from app.models.research import Article

class SynthesisRequest(BaseModel):
    """
    Payload for the /synthesize endpoint.
    Carries the context (articles) for the LLM to reason over.
    """
    query: str = Field(..., min_length=5, description="The original research question.")

    # HARD LIMIT: Max 10 articles to synthesize at once.
    # This keeps token usage within the DeepSeek/Llama limits and ensures speed.
    articles: List[Article] = Field(
        ...,
        min_length=1,
        max_length=10,
        description="Selected articles to synthesize."
    )
