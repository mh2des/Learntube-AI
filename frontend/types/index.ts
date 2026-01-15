// Video types
export interface VideoFormat {
  format_id: string;
  ext: string;
  resolution: string;
  height: number | null;
  width: number | null;
  filesize: number | null;
  vcodec: string;
  acodec: string;
  fps: number | null;
  tbr: number | null;
  quality: number;
  format_note: string;
}

// Alias for Format to match component usage
export type Format = VideoFormat;

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
  id: string;
}

export interface Chapter {
  start_time: number;
  end_time: number;
  title: string;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnails: Thumbnail[];
  duration: number;
  duration_string: string;
  view_count: number;
  like_count: number;
  upload_date: string;
  uploader: string;
  uploader_id: string;
  channel: string;
  channel_id: string;
  categories: string[];
  tags: string[];
  chapters: Chapter[];
  formats: VideoFormat[];
  qualities: string[];
  subtitles: Record<string, { ext: string; url: string }[]>;
  auto_captions: Record<string, { ext: string; url: string }[]>;
  is_live: boolean;
  webpage_url: string;
}

export interface PlaylistInfo {
  id: string;
  title: string;
  description: string;
  uploader: string;
  video_count: number;
  videos: {
    id: string;
    title: string;
    duration: number;
    url: string;
  }[];
}

// Download types
export interface DownloadOptions {
  quality: string;
  format: 'mp4' | 'webm' | 'mkv';
}

export interface AudioOptions {
  format: 'mp3' | 'm4a' | 'wav' | 'ogg';
  quality: '128' | '192' | '256' | '320';
}

// Editor types
export interface TrimSegment {
  id: string;
  start: number;
  end: number;
  label?: string;
}

export interface EditorState {
  videoFile: File | null;
  segments: TrimSegment[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

// Processing types
export interface ProcessingJob {
  id: string;
  type: 'trim' | 'convert' | 'extract' | 'merge';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  input: string;
  output?: Blob;
  error?: string;
}
