import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Video API endpoints
export const videoApi = {
  getInfo: async (url: string) => {
    const response = await api.get('/api/v1/video/info', { params: { url } });
    return response.data;
  },

  getFormats: async (url: string) => {
    const response = await api.get('/api/v1/video/formats', { params: { url } });
    return response.data;
  },

  getDownloadUrl: async (url: string, quality = 'best', format = 'mp4') => {
    const response = await api.get('/api/v1/video/download', {
      params: { url, quality, format },
    });
    return response.data;
  },

  getAudioUrl: async (url: string, format = 'mp3', quality = '192') => {
    const response = await api.get('/api/v1/video/audio', {
      params: { url, format, quality },
    });
    return response.data;
  },

  getSubtitles: async (url: string, lang = 'en', auto = true) => {
    const response = await api.get('/api/v1/video/subtitles', {
      params: { url, lang, auto },
    });
    return response.data;
  },

  getThumbnail: async (url: string, size = 'maxres') => {
    const response = await api.get('/api/v1/video/thumbnail', {
      params: { url, size },
    });
    return response.data;
  },

  getPlaylistInfo: async (url: string) => {
    const response = await api.get('/api/v1/video/playlist', { params: { url } });
    return response.data;
  },

  getPlaylist: async (url: string) => {
    const response = await api.get('/api/v1/video/playlist', { params: { url } });
    return response.data;
  },
};

// Health check
export const healthApi = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};
