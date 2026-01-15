import { create } from 'zustand';
import type { VideoInfo } from '@/types';

interface VideoState {
  // Current video
  currentUrl: string;
  videoInfo: VideoInfo | null;
  isLoading: boolean;
  error: string | null;

  // Download state
  downloadProgress: number;
  isDownloading: boolean;

  // Actions
  setCurrentUrl: (url: string) => void;
  setVideoInfo: (info: VideoInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDownloadProgress: (progress: number) => void;
  setIsDownloading: (downloading: boolean) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentUrl: '',
  videoInfo: null,
  isLoading: false,
  error: null,
  downloadProgress: 0,
  isDownloading: false,

  setCurrentUrl: (url) => set({ currentUrl: url }),
  setVideoInfo: (info) => set({ videoInfo: info }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setDownloadProgress: (progress) => set({ downloadProgress: progress }),
  setIsDownloading: (downloading) => set({ isDownloading: downloading }),
  reset: () =>
    set({
      currentUrl: '',
      videoInfo: null,
      isLoading: false,
      error: null,
      downloadProgress: 0,
      isDownloading: false,
    }),
}));
