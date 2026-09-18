# File: backend/app/models/research.py

from typing import List, Optional
from pydantic import BaseModel, Field

class Article(BaseModel):
    """
    Represents a single research paper or clinical study.
    Aligned with PubMed E-Utilities XML schema.
    """
    id: str
    title: str
    abstract: str
    url: str
    # New fields for "Chief Medical Officer" grade citations
    journal: str = "Unknown Journal"
    authors: List[str] = []
    pubDate: str = "n.d."

class ResearchResponse(BaseModel):
    """
    Standardized response for search results.
    """
    query: str
    results: List[Article]

class ResearchRequest(BaseModel):
    """
    Validates incoming search requests.
    """
    query: str = Field(..., min_length=3, description="The medical research question.")
    limit: Optional[int] = Field(5, ge=1, le=10, description="Max articles to retrieve (Hard cap at 10).")
