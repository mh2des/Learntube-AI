# LearnTube AI Backend

## 🎓 AI-Powered Learning Platform Backend

Clean, professional FastAPI backend for LearnTube AI - the educational SaaS platform that transforms YouTube videos into comprehensive study materials.

## ⚠️ Important: No Download Capabilities

This backend **DOES NOT** download YouTube videos. It only:
- Fetches video metadata (title, thumbnail, duration)
- Retrieves video information for embedding
- Gets available caption languages
- Provides video ID for YouTube's embedded player

All video playback happens through YouTube's official embedded player, complying with YouTube's Terms of Service.

## 🚀 Features

- **Video Metadata Extraction**: Get video info without downloading
- **Caption Information**: Discover available subtitle languages
- **Embed Support**: Get video IDs and embed URLs
- **Clean API**: RESTful endpoints with comprehensive documentation
- **CORS Enabled**: Ready for frontend integration

## 📋 Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

## 🛠️ Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment**:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file** (optional):
   ```env
   PROJECT_NAME="LearnTube AI"
   DEBUG=True
   FRONTEND_URL=http://localhost:3000
   SECRET_KEY=your-secret-key-here
   ```

## 🏃 Running the Server

Start the development server:

```bash
uvicorn main:app --reload --port 8002
```

The API will be available at:
- API: http://localhost:8002
- Documentation: http://localhost:8002/docs
- Alternative docs: http://localhost:8002/redoc

## 📚 API Endpoints

### Health Check
- `GET /health` - Check API status
- `GET /` - API information

### Video Metadata (No Downloads)
- `GET /api/v1/video/metadata?url={youtube_url}` - Get video metadata
- `GET /api/v1/video/captions?url={youtube_url}` - Get available captions
- `GET /api/v1/video/embed-info?url={youtube_url}` - Get embedding information

## 🏗️ Project Structure

```
backend/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env                   # Environment variables (create this)
└── app/
    ├── __init__.py
    ├── api/
    │   ├── __init__.py
    │   └── v1/
    │       ├── __init__.py
    │       ├── health.py   # Health check endpoints
    │       └── video.py    # Video metadata endpoints
    ├── core/
    │   ├── __init__.py
    │   └── config.py       # Application configuration
    ├── schemas/
    │   ├── __init__.py
    │   └── video.py        # Pydantic schemas
    └── services/
        ├── __init__.py
        └── youtube_metadata.py  # YouTube metadata service
```

## 🔒 Legal & Compliance

✅ **100% Legal and YouTube ToS Compliant**:
- Uses only YouTube's public metadata
- No video downloading functionality
- Videos played through official YouTube embedded player
- Complies with YouTube's Terms of Service

## 🛡️ Security

- Environment-based configuration
- CORS properly configured
- No file uploads or downloads
- API key support (for future features)

## 🧪 Testing

Test the API using the interactive documentation:

1. Open http://localhost:8002/docs
2. Try the `/api/v1/video/info` endpoint
3. Enter a YouTube URL (e.g., `https://youtu.be/cqDQV5g7zHo`)

## 📦 Dependencies

- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **yt-dlp**: YouTube metadata extraction (no downloads, metadata only)
- **Pydantic**: Data validation
- **HTTPX**: Async HTTP client

## 🚀 Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Use a production ASGI server (Gunicorn + Uvicorn workers)
3. Set up proper CORS origins
4. Use environment variables for secrets
5. Consider adding rate limiting
6. Set up monitoring and logging

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_NAME` | Application name | "LearnTube AI" |
| `DEBUG` | Debug mode | True |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `SECRET_KEY` | Secret key for sessions | (change in production) |
| `API_V1_PREFIX` | API version prefix | /api/v1 |

## 🤝 Contributing

This is the commercial SaaS version of LearnTube AI. For contribution guidelines, contact the maintainers.

## 📄 License

Proprietary - All rights reserved.

## 🆘 Support

For support and inquiries, visit our documentation or contact support@learntube.ai

---

**Built with ❤️ for learners worldwide**
