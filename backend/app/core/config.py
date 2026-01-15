"""Application configuration settings."""
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # API Settings
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "LearnTube AI"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    DESCRIPTION: str = "AI-Powered Learning Platform - Transform YouTube videos into study materials"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    
    # AI Service API Keys (Optional - used in frontend)
    GROQ_API_KEY: Optional[str] = None  # For transcription
    GEMINI_API_KEY: Optional[str] = None  # For AI features
    
    # Database (Optional - for future features)
    DATABASE_URL: Optional[str] = None
    
    # Redis (Optional - for caching)
    REDIS_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
