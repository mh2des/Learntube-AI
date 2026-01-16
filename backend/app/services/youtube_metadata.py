"""YouTube metadata extraction service - NO DOWNLOADS.

Uses yt-dlp for metadata extraction only. No video/audio downloading.
This is ToS-compliant as we only extract publicly available information.
"""
import re
import asyncio
import time
from typing import Dict, Optional
from concurrent.futures import ThreadPoolExecutor
import yt_dlp


class YouTubeMetadataService:
    """Extract YouTube video metadata and captions without downloading."""
    
    # Thread pool for running yt-dlp (which is synchronous)
    _executor = ThreadPoolExecutor(max_workers=3)

    # Simple in-memory cache to speed up repeated requests
    _cache: Dict[str, Dict] = {}
    _cache_ttl_seconds: int = 600  # 10 minutes
    _audio_cache: Dict[str, Dict] = {}
    _audio_cache_ttl_seconds: int = 600  # 10 minutes
    _inflight: Dict[str, asyncio.Task] = {}
    _lock = asyncio.Lock()

    def get_cached_metadata(self, video_id: str) -> Optional[Dict]:
        """Return cached metadata if valid, otherwise None."""
        cached = self._cache.get(video_id)
        if cached and cached.get("expires_at", 0) > time.time():
            return cached.get("data")
        return None

    def get_cached_audio_url(self, video_id: str) -> Optional[str]:
        """Return cached audio URL if valid, otherwise None."""
        cached = self._audio_cache.get(video_id)
        if cached and cached.get("expires_at", 0) > time.time():
            return cached.get("audio_url")
        return None
    
    # yt-dlp options - METADATA ONLY, NO DOWNLOADS
    YDL_OPTS = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,  # CRITICAL: Never download
        'writesubtitles': False,  # Don't write to disk
        'writeautomaticsub': False,  # Don't write to disk
        'subtitlesformat': 'vtt',
        'ignoreerrors': True,
    }
    
    @staticmethod
    def extract_video_id(url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats."""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/shorts\/([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def _extract_info_sync(self, url: str) -> Dict:
        """Synchronous extraction using yt-dlp."""
        with yt_dlp.YoutubeDL(self.YDL_OPTS) as ydl:
            return ydl.extract_info(url, download=False)

    def _extract_audio_url_sync(self, url: str) -> str:
        """Extract best audio URL without downloading."""
        audio_opts = {
            **self.YDL_OPTS,
            "format": "bestaudio/best",
            "noplaylist": True,
        }
        with yt_dlp.YoutubeDL(audio_opts) as ydl:
            info = ydl.extract_info(url, download=False)

        if not info:
            raise ValueError("Could not extract audio information")

        # If a single format was selected, yt-dlp exposes a direct URL
        direct_url = info.get("url")
        if direct_url:
            return direct_url

        # Fallback: pick the best audio-only format
        formats = info.get("formats") or []
        audio_formats = [
            f for f in formats
            if f.get("acodec") not in (None, "none")
        ]
        if not audio_formats:
            raise ValueError("No audio formats available")

        # Prefer higher bitrate
        best_audio = sorted(
            audio_formats,
            key=lambda f: (f.get("abr") or 0, f.get("tbr") or 0),
            reverse=True,
        )[0]

        if not best_audio.get("url"):
            raise ValueError("Failed to resolve audio stream URL")

        return best_audio["url"]

    async def _fetch_metadata(self, url: str, video_id: str) -> Dict:
        """Fetch metadata from yt-dlp and normalize response."""
        # Run yt-dlp in thread pool (it's synchronous)
        loop = asyncio.get_event_loop()
        info = await loop.run_in_executor(
            self._executor,
            self._extract_info_sync,
            url
        )

        if not info:
            raise ValueError("Could not extract video information")

        # Extract subtitles info
        subtitles = {}
        auto_captions = {}

        # Manual subtitles (creator-uploaded)
        if info.get('subtitles'):
            for lang, subs in info['subtitles'].items():
                vtt_sub = next((s for s in subs if s.get('ext') == 'vtt'), None)
                if vtt_sub:
                    subtitles[lang] = [{'ext': 'vtt', 'url': vtt_sub.get('url', '')}]

        # Auto-generated captions
        if info.get('automatic_captions'):
            for lang, subs in info['automatic_captions'].items():
                vtt_sub = next((s for s in subs if s.get('ext') == 'vtt'), None)
                if vtt_sub:
                    auto_captions[lang] = [{'ext': 'vtt', 'url': vtt_sub.get('url', '')}]

        # Detect original language
        original_language = info.get('language') or 'en'

        # Build metadata response
        metadata = {
            "video_id": video_id,
            "title": info.get('title', 'Unknown Title'),
            "description": info.get('description', ''),
            "thumbnail": info.get('thumbnail') or f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
            "duration": info.get('duration', 0),
            "view_count": info.get('view_count'),
            "like_count": info.get('like_count'),
            "author": info.get('uploader', 'Unknown'),
            "channel_id": info.get('channel_id', ''),
            "channel_url": info.get('channel_url', ''),
            "upload_date": info.get('upload_date'),
            "categories": info.get('categories', []),
            "tags": info.get('tags', []),
            "embed_url": f"https://www.youtube.com/embed/{video_id}",
            "watch_url": f"https://www.youtube.com/watch?v={video_id}",
            "subtitles": subtitles,
            "auto_captions": auto_captions,
            "original_language": original_language,
        }

        return metadata
    
    async def get_video_metadata(self, url: str) -> Dict:
        """
        Get video metadata using yt-dlp (no download, metadata only).
        
        Returns comprehensive metadata including:
            - title, description, thumbnail
            - duration, view count, author
            - Available subtitles and auto-captions with URLs
            - video_id for embedding
            - NO video/audio downloading
        """
        try:
            video_id = self.extract_video_id(url)
            if not video_id:
                raise ValueError("Invalid YouTube URL")
            
            # Return cached result if available
            cached = self._cache.get(video_id)
            if cached and cached.get("expires_at", 0) > time.time():
                return cached["data"]

            # Deduplicate concurrent requests for the same video
            async with self._lock:
                cached = self._cache.get(video_id)
                if cached and cached.get("expires_at", 0) > time.time():
                    return cached["data"]

                task = self._inflight.get(video_id)
                if not task:
                    task = asyncio.create_task(self._fetch_metadata(url, video_id))
                    self._inflight[video_id] = task

            try:
                metadata = await task
            finally:
                async with self._lock:
                    if self._inflight.get(video_id) is task:
                        del self._inflight[video_id]

            # Cache result
            self._cache[video_id] = {
                "data": metadata,
                "expires_at": time.time() + self._cache_ttl_seconds,
            }

            return metadata
            
        except ValueError:
            raise
        except Exception as e:
            raise ValueError(f"Failed to fetch video metadata: {str(e)}")

    async def get_audio_url(self, url: str) -> str:
        """Get best audio URL for Groq transcription (no download)."""
        video_id = self.extract_video_id(url)
        if not video_id:
            raise ValueError("Invalid YouTube URL")

        cached_audio = self.get_cached_audio_url(video_id)
        if cached_audio:
            return cached_audio

        loop = asyncio.get_event_loop()
        audio_url = await loop.run_in_executor(
            self._executor,
            self._extract_audio_url_sync,
            url
        )

        self._audio_cache[video_id] = {
            "audio_url": audio_url,
            "expires_at": time.time() + self._audio_cache_ttl_seconds,
        }

        return audio_url
    
    async def get_captions_info(self, url: str) -> Dict:
        """Get available caption/subtitle languages."""
        try:
            metadata = await self.get_video_metadata(url)
            
            return {
                "video_id": metadata.get("video_id"),
                "available": bool(metadata.get("subtitles") or metadata.get("auto_captions")),
                "subtitles": list(metadata.get("subtitles", {}).keys()),
                "auto_captions": list(metadata.get("auto_captions", {}).keys()),
                "original_language": metadata.get("original_language", "en"),
            }
            
        except Exception as e:
            return {
                "available": False,
                "subtitles": [],
                "auto_captions": [],
                "error": str(e)
            }


# Singleton instance
youtube_metadata_service = YouTubeMetadataService()
