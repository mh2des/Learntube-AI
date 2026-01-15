"""Pydantic schemas for API requests and responses."""
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Dict, List
from datetime import datetime


class VideoMetadataRequest(BaseModel):
    """Request schema for video metadata."""
    url: str = Field(..., description="YouTube video URL")


class VideoMetadataResponse(BaseModel):
    """Response schema for video metadata."""
    success: bool
    data: Dict
    

class CaptionsInfoResponse(BaseModel):
    """Response schema for captions information."""
    success: bool
    data: Dict


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    message: str
    timestamp: Optional[datetime] = None
