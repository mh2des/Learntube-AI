"""
LearnTube AI - FastAPI Backend Application
AI-Powered Learning Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import video, health

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "Health",
            "description": "Health check and system status endpoints"
        },
        {
            "name": "Video",
            "description": "YouTube video metadata endpoints (no download capabilities)"
        }
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3004",
        "http://127.0.0.1:3004",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(video.router, prefix=settings.API_V1_PREFIX, tags=["Video"])


@app.on_event("startup")
async def startup_event():
    """Run on application startup."""
    print(f"🚀 {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"📚 AI-Powered Learning Platform")
    print(f"📡 API Documentation: http://localhost:8000/docs")
    print(f"🎓 Transform YouTube videos into study materials")
    print(f"⚠️  No download capabilities - metadata only for learning")


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown."""
    print("👋 LearnTube AI shutting down...")
