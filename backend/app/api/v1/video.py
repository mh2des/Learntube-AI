"""Video metadata endpoints - NO DOWNLOAD capabilities."""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse
import httpx
from app.services.youtube_metadata import youtube_metadata_service
from app.schemas.video import VideoMetadataResponse, CaptionsInfoResponse

router = APIRouter(prefix="/video")


@router.get("/info")
async def get_video_info(
    url: str = Query(..., description="YouTube video URL")
):
    """
    Get comprehensive video info for the learning interface.
    
    This is the main endpoint used by the frontend to load video data.
    Returns metadata in the format expected by the learn page.
    """
    try:
        metadata = await youtube_metadata_service.get_video_metadata(url)
        video_id = metadata["video_id"]
        
        # Format duration as string
        duration = metadata.get("duration") or 0
        hours = duration // 3600
        minutes = (duration % 3600) // 60
        seconds = duration % 60
        if hours > 0:
            duration_string = f"{hours}:{minutes:02d}:{seconds:02d}"
        else:
            duration_string = f"{minutes}:{seconds:02d}"
        
        # Build response in format expected by frontend
        # Now using real subtitle data from yt-dlp
        response_data = {
            "id": video_id,
            "title": metadata.get("title", "Unknown Title"),
            "description": metadata.get("description", ""),
            "thumbnail": metadata.get("thumbnail", f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"),
            "duration": duration,
            "duration_string": duration_string,
            "uploader": metadata.get("author", "Unknown"),
            "view_count": metadata.get("view_count"),
            "embed_url": metadata.get("embed_url", f"https://www.youtube.com/embed/{video_id}"),
            "watch_url": metadata.get("watch_url", f"https://www.youtube.com/watch?v={video_id}"),
            # Real subtitle data from yt-dlp
            "subtitles": metadata.get("subtitles", {}),
            "auto_captions": metadata.get("auto_captions", {}),
            "original_language": metadata.get("original_language", "en"),
        }
        
        return {
            "success": True,
            "data": response_data
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch video info: {str(e)}"
        )


@router.get("/info/fast")
async def get_video_info_fast(
    url: str = Query(..., description="YouTube video URL")
):
    """
    Get fast video info using oEmbed (instant response).

    Uses cached full metadata when available, otherwise returns
    minimal data (title, thumbnail, author) without subtitles.
    """
    try:
        video_id = youtube_metadata_service.extract_video_id(url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")

        # Serve from cache if available
        cached = youtube_metadata_service.get_cached_metadata(video_id)
        if cached:
            return {
                "success": True,
                "data": {
                    "id": cached.get("video_id"),
                    "title": cached.get("title", "Unknown Title"),
                    "description": cached.get("description", ""),
                    "thumbnail": cached.get("thumbnail"),
                    "duration": cached.get("duration", 0),
                    "duration_string": "0:00" if not cached.get("duration") else None,
                    "uploader": cached.get("author", "Unknown"),
                    "view_count": cached.get("view_count"),
                    "embed_url": cached.get("embed_url", f"https://www.youtube.com/embed/{video_id}"),
                    "watch_url": cached.get("watch_url", f"https://www.youtube.com/watch?v={video_id}"),
                    "subtitles": cached.get("subtitles", {}),
                    "auto_captions": cached.get("auto_captions", {}),
                    "original_language": cached.get("original_language", "en"),
                    "source": "cache",
                }
            }

        # Fast oEmbed fetch
        async with httpx.AsyncClient(timeout=6.0) as client:
            response = await client.get(
                "https://www.youtube.com/oembed",
                params={"url": url, "format": "json"}
            )
            response.raise_for_status()
            oembed = response.json()

        # Minimal response for instant UI
        return {
            "success": True,
            "data": {
                "id": video_id,
                "title": oembed.get("title", "Unknown Title"),
                "description": "",
                "thumbnail": oembed.get("thumbnail_url", f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"),
                "duration": 0,
                "duration_string": "0:00",
                "uploader": oembed.get("author_name", "Unknown"),
                "view_count": None,
                "embed_url": f"https://www.youtube.com/embed/{video_id}",
                "watch_url": f"https://www.youtube.com/watch?v={video_id}",
                "subtitles": {},
                "auto_captions": {},
                "original_language": "en",
                "source": "oembed",
            }
        }
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Failed to fetch fast video info")


@router.get("/subtitles/proxy")
async def proxy_subtitles(
    url: str = Query(..., description="Subtitle URL to proxy")
):
    """
    Proxy subtitle files to bypass CORS restrictions.
    
    YouTube's timedtext API doesn't allow cross-origin requests,
    so we proxy the request through our backend.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(url)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Failed to fetch subtitles from source"
                )
            
            return PlainTextResponse(
                content=response.text,
                media_type="text/vtt"
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Subtitle request timed out")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to proxy subtitles: {str(e)}"
        )


@router.get("/metadata", response_model=VideoMetadataResponse)
async def get_video_metadata(
    url: str = Query(..., description="YouTube video URL")
):
    """
    Get video metadata (title, thumbnail, duration, etc.) - NO DOWNLOAD.
    
    This endpoint only fetches metadata for learning purposes:
    - Video title, description, thumbnail
    - Duration, view count, author information
    - Video ID for embedding
    - NO video downloading capabilities
    """
    try:
        metadata = await youtube_metadata_service.get_video_metadata(url)
        return {
            "success": True,
            "data": metadata
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch video metadata: {str(e)}"
        )


@router.get("/captions", response_model=CaptionsInfoResponse)
async def get_captions_info(
    url: str = Query(..., description="YouTube video URL")
):
    """
    Get available caption/subtitle languages for a video.
    
    This helps users understand what languages are available
    for transcription and learning.
    """
    try:
        captions_info = await youtube_metadata_service.get_captions_info(url)
        return {
            "success": True,
            "data": captions_info
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch captions info: {str(e)}"
        )


@router.get("/embed-info")
async def get_embed_info(
    url: str = Query(..., description="YouTube video URL")
):
    """
    Get video information optimized for embedding in learning interface.
    
    Returns minimal metadata needed for video player:
    - video_id, embed_url
    - title, thumbnail
    - duration
    """
    try:
        metadata = await youtube_metadata_service.get_video_metadata(url)
        
        # Return only essential embedding info
        embed_info = {
            "video_id": metadata["video_id"],
            "embed_url": metadata["embed_url"],
            "watch_url": metadata["watch_url"],
            "title": metadata["title"],
            "thumbnail": metadata["thumbnail"],
            "duration": metadata["duration"],
            "author": metadata["author"],
        }
        
        return {
            "success": True,
            "data": embed_info
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch embed info: {str(e)}"
        )


@router.get("/audio-url")
async def get_audio_url(
    url: str = Query(..., description="YouTube video URL")
):
    """
    Get best audio stream URL for AI transcription (no download, no storage).
    """
    try:
        audio_url = await youtube_metadata_service.get_audio_url(url)
        return {
            "success": True,
            "data": {
                "audio_url": audio_url
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch audio URL: {str(e)}"
        )
