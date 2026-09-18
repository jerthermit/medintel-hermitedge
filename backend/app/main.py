# File: backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
# Import routers directly to avoid potential __init__ circular dependency or missing export issues
from app.api.llm import router as llm_router
from app.api.pubmed import router as pubmed_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="World-Class Medical Research Assistant API",
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# --- CORS CONFIGURATION (CRITICAL FIX) ---
# The frontend is likely blocked because ALLOWED_ORIGINS might be a CSV string in the environment.
# We explicitly convert it to a list to ensure the middleware works correctly.
allowed_origins = settings.ALLOWED_ORIGINS
if isinstance(allowed_origins, str):
    allowed_origins = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTERS ---
# We use explicit prefixes to ensure clean URL namespacing
app.include_router(llm_router, prefix="/api/llm", tags=["Reasoning Engine"])
app.include_router(pubmed_router, prefix="/api/pubmed", tags=["Research Data"])

# --- HEALTH CHECK ---
@app.get("/", tags=["Status"])
@app.get("/health", tags=["Status"])
async def health_check():
    """
    Root endpoint to verify backend availability and versioning.
    This serves as the 'ping' for the frontend to know the backend is ready.
    """
    return {
        "status": "online",
        "version": settings.VERSION,
        "project": settings.PROJECT_NAME,
        "docs": "/api/docs"
    }
