// Learn Page - AI-Powered Learning Suite
// Video player + Transcript + AI Tools

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  Upload,
  Loader2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  FileText,
  Sparkles,
  Layers,
  ClipboardList,
  MessageCircle,
  BookOpen,
  Link,
  AlertCircle,
  Subtitles,
  Languages,
  Globe
} from 'lucide-react';
import {
  InteractiveTranscript,
  AISummary,
  FlashcardViewer,
  QuizComponent,
  AITutorChat,
} from '@/components/learn';
import { useTranscription, transcribeFromUrl, type TranscriptSegment } from '@/lib/ai';
import { cn } from '@/lib/utils';

// Available languages for translation
const TRANSLATION_LANGUAGES: Record<string, string> = {
  'ar': 'Arabic',
  'zh': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)', 
  'cs': 'Czech',
  'nl': 'Dutch',
  'en': 'English',
  'fr': 'French',
  'de': 'German',
  'el': 'Greek',
  'hi': 'Hindi',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'pt-BR': 'Portuguese (Brazil)',
  'ru': 'Russian',
  'es': 'Spanish',
  'es-419': 'Spanish (Latin America)',
  'sv': 'Swedish',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese',
};

// YouTube video info type
interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  duration_string: string;
  uploader: string;
  view_count: number;
  subtitles?: Record<string, Array<{ ext: string; url: string }>>;
  auto_captions?: Record<string, Array<{ ext: string; url: string }>>;
  original_language?: string;
}

export default function LearnPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('id');
  
  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // YouTube video info state
  const [youtubeInfo, setYoutubeInfo] = useState<YouTubeVideoInfo | null>(null);
  
  // Available subtitle languages (manual vs auto-captions)
  const [manualSubtitles, setManualSubtitles] = useState<string[]>([]);
  const [autoCaptions, setAutoCaptions] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<'manual' | 'auto' | null>(null);
  const [isLoadingSubtitles, setIsLoadingSubtitles] = useState(false);

  // Transcript state
  const { transcribe, isLoading: isTranscribing, error: transcribeError, result: transcriptResult } = useTranscription();
  const [transcript, setTranscript] = useState<string>('');
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [transcriptSource, setTranscriptSource] = useState<'youtube-manual' | 'youtube-auto' | 'ai' | null>(null);
  
  // Translation state - the "active" transcript is what AI tools use
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTranscript, setTranslatedTranscript] = useState<string | null>(null);
  const [translatedSegments, setTranslatedSegments] = useState<TranscriptSegment[] | null>(null);
  const [translatedLanguage, setTranslatedLanguage] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<string>('en');
  const [translationError, setTranslationError] = useState<string | null>(null);
  
  // The "active" transcript - either translated or original
  // This is what all AI tools (flashcards, summary, quiz) will use
  const activeTranscript = translatedTranscript || transcript;
  const activeSegments = translatedSegments || segments;
  const activeLanguage = translatedLanguage || selectedLanguage;
  
  // URL input state
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  // Active learning tool tab
  const [activeTab, setActiveTab] = useState('transcript');

  // Load video from library if ID provided
  useEffect(() => {
    // Video loading from library will be implemented with IndexedDB
    // For now, users can upload directly
  }, [videoId]);

  // Update current time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoSrc]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setVideoTitle(file.name);
    setTranscript('');
    setSegments([]);
  }, []);

  // Handle YouTube URL
  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoadingUrl(true);
    setUrlError(null);
    setManualSubtitles([]);
    setAutoCaptions([]);
    setSelectedLanguage(null);
    setSelectedSource(null);
    setTranscript('');
    setSegments([]);
    setTranscriptSource(null);
    setCurrentUrl(urlInput.trim());

    try {
      // Fast path: instant metadata via oEmbed/cache
      const fastResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/video/info/fast?url=${encodeURIComponent(urlInput)}`
      );

      if (!fastResponse.ok) {
        throw new Error('Failed to fetch video info');
      }

      const fastResult = await fastResponse.json();
      const fastData = fastResult.data;

      // Render instantly with fast metadata
      setYoutubeInfo({
        id: fastData.id,
        title: fastData.title,
        description: fastData.description,
        thumbnail: fastData.thumbnail,
        duration: fastData.duration,
        duration_string: fastData.duration_string,
        uploader: fastData.uploader,
        view_count: fastData.view_count,
        subtitles: fastData.subtitles,
        auto_captions: fastData.auto_captions,
        original_language: fastData.original_language,
      });
      setVideoTitle(fastData.title);
      setDuration(fastData.duration);
      setIsLoadingUrl(false);

      // Background: full metadata (subtitles, duration, etc.)
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/video/info?url=${encodeURIComponent(urlInput)}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch full video info');
          }
          return response.json();
        })
        .then((result) => {
          const data = result.data;

          setYoutubeInfo({
            id: data.id,
            title: data.title,
            description: data.description,
            thumbnail: data.thumbnail,
            duration: data.duration,
            duration_string: data.duration_string,
            uploader: data.uploader,
            view_count: data.view_count,
            subtitles: data.subtitles,
            auto_captions: data.auto_captions,
            original_language: data.original_language,
          });
          setVideoTitle(data.title);
          setDuration(data.duration);

          // Store available subtitle languages (separate manual and auto)
          if (data.subtitles && Object.keys(data.subtitles).length > 0) {
            setManualSubtitles(Object.keys(data.subtitles));
          }
          if (data.auto_captions && Object.keys(data.auto_captions).length > 0) {
            setAutoCaptions(Object.keys(data.auto_captions));
          }
        })
        .catch((error) => {
          console.error('Background metadata fetch failed:', error);
        });
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : 'Failed to load video');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Load subtitles for selected language
  const loadSubtitles = async (langCode: string, source: 'manual' | 'auto') => {
    const subtitleData = source === 'manual' 
      ? youtubeInfo?.subtitles?.[langCode]
      : youtubeInfo?.auto_captions?.[langCode];
    
    if (!subtitleData) return;
    
    setIsLoadingSubtitles(true);
    setSelectedLanguage(langCode);
    setSelectedSource(source);
    
    try {
      const vttSub = subtitleData.find((s: { ext: string }) => s.ext === 'vtt');
      if (vttSub) {
        // Use backend proxy to bypass CORS restrictions
        const proxyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/video/subtitles/proxy?url=${encodeURIComponent(vttSub.url)}`;
        const subResponse = await fetch(proxyUrl);
        
        if (!subResponse.ok) {
          throw new Error(`Failed to fetch subtitles: ${subResponse.status}`);
        }
        
        const vttText = await subResponse.text();
        setTranscript(vttText);
        const parsedSegments = parseVTTToSegments(vttText);
        setSegments(parsedSegments);
        setTranscriptSource(source === 'manual' ? 'youtube-manual' : 'youtube-auto');
        
        // Clear any previous translation when loading new subtitles
        setTranslatedTranscript(null);
        setTranslatedSegments(null);
        setTranslatedLanguage(null);
        setTranslationError(null);
      }
    } catch (e) {
      console.error('Could not fetch subtitles:', e);
    } finally {
      setIsLoadingSubtitles(false);
    }
  };

  // Translate transcript to target language
  const handleTranslate = useCallback(async () => {
    if (!transcript || !targetLanguage || targetLanguage === selectedLanguage) return;
    
    setIsTranslating(true);
    setTranslationError(null);
    
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: transcript,
          targetLanguage,
          sourceLanguage: selectedLanguage,
          videoTitle,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Translation failed');
      }
      
      const result = await response.json();
      const translatedVTT = result.data.translatedContent;
      
      setTranslatedTranscript(translatedVTT);
      setTranslatedSegments(parseVTTToSegments(translatedVTT));
      setTranslatedLanguage(targetLanguage);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslationError(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  }, [transcript, targetLanguage, selectedLanguage, videoTitle]);

  // Clear translation and revert to original
  const clearTranslation = useCallback(() => {
    setTranslatedTranscript(null);
    setTranslatedSegments(null);
    setTranslatedLanguage(null);
    setTranslationError(null);
  }, []);

  // Get language display name
  const getLanguageName = (code: string): string => {
    const languageNames: Record<string, string> = {
      'en': 'English',
      'en-US': 'English (US)',
      'en-GB': 'English (UK)',
      'ar': 'Arabic',
      'es': 'Spanish',
      'es-419': 'Spanish (Latin America)',
      'fr': 'French',
      'de': 'German',
      'de-DE': 'German (Germany)',
      'it': 'Italian',
      'pt': 'Portuguese',
      'pt-BR': 'Portuguese (Brazil)',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'zh-Hans': 'Chinese (Simplified)',
      'zh-Hant': 'Chinese (Traditional)',
      'hi': 'Hindi',
      'id': 'Indonesian',
      'tr': 'Turkish',
      'vi': 'Vietnamese',
      'th': 'Thai',
      'pl': 'Polish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'cs': 'Czech',
      'uk': 'Ukrainian',
    };
    return languageNames[code] || code;
  };

  // Parse VTT subtitles to segments
  const parseVTTToSegments = (vtt: string): TranscriptSegment[] => {
    const segments: TranscriptSegment[] = [];
    const lines = vtt.split('\n');
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      // Look for timestamp line: 00:00:00.000 --> 00:00:05.000
      if (line.includes('-->')) {
        const [start, end] = line.split('-->').map(t => {
          const parts = t.trim().split(':');
          if (parts.length === 3) {
            const [h, m, s] = parts;
            return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s.replace(',', '.'));
          }
          return 0;
        });
        
        // Get text (may span multiple lines until empty line)
        let text = '';
        i++;
        while (i < lines.length && lines[i].trim() !== '') {
          text += (text ? ' ' : '') + lines[i].trim();
          i++;
        }
        
        if (text) {
          segments.push({
            id: segments.length,
            start,
            end,
            text: text.replace(/<[^>]*>/g, ''), // Remove HTML tags
          });
        }
      }
      i++;
    }
    
    return segments;
  };

  // Transcribe video
  const handleTranscribe = async () => {
    try {
      // Local upload: transcribe directly from file blob
      if (videoSrc) {
        const response = await fetch(videoSrc);
        const blob = await response.blob();
        const audioFile = new File([blob], 'audio.mp4', { type: blob.type || 'video/mp4' });
        await transcribe(audioFile);
        return;
      }

      // YouTube: fetch best audio URL for transcription
      if (currentUrl) {
        const audioResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/video/audio-url?url=${encodeURIComponent(currentUrl)}`
        );

        if (!audioResponse.ok) {
          throw new Error('Failed to fetch audio stream for transcription');
        }

        const audioResult = await audioResponse.json();
        const audioUrl = audioResult?.data?.audio_url;
        if (!audioUrl) {
          throw new Error('No audio stream available for transcription');
        }

        const result = await transcribeFromUrl(audioUrl);
        setTranscript(result.text);
        setSegments(result.segments);
        setTranscriptSource('ai');
        return;
      }
    } catch (error) {
      console.error('Transcription error:', error);
    }
  };

  // Update transcript when result changes
  useEffect(() => {
    if (transcriptResult) {
      setTranscript(transcriptResult.text);
      setSegments(transcriptResult.segments);
      setTranscriptSource('ai');
    }
  }, [transcriptResult]);

  // Seek to time
  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Playback controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Learning Studio</h1>
            <p className="text-muted-foreground">AI-powered learning from any video</p>
          </div>
        </div>
      </div>

      {/* Video Input Section */}
      {!videoSrc && !youtubeInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Load a Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="font-medium">Upload a video or audio file</p>
                <p className="text-sm text-muted-foreground">
                  Supports MP4, WebM, MP3, WAV, and more
                </p>
              </label>
            </div>

            {/* URL Input */}
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Or paste a YouTube URL..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                />
              </div>
              <Button onClick={handleUrlSubmit} disabled={isLoadingUrl || !urlInput.trim()}>
                {isLoadingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Load'}
              </Button>
            </div>

            {urlError && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                {urlError}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* YouTube Video Info Panel */}
      {youtubeInfo && !videoSrc && (
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-6">
              {/* Thumbnail */}
              <div className="flex-shrink-0">
                <img
                  src={youtubeInfo.thumbnail}
                  alt={youtubeInfo.title}
                  className="w-64 rounded-lg"
                />
              </div>
              {/* Info */}
              <div className="flex-1 space-y-3">
                <h2 className="text-xl font-bold">{youtubeInfo.title}</h2>
                <p className="text-muted-foreground">{youtubeInfo.uploader}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{youtubeInfo.view_count?.toLocaleString()} views</span>
                  <span>{youtubeInfo.duration_string}</span>
                </div>
                
                {/* Transcription Options */}
                <div className="pt-3 border-t space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Subtitles className="h-4 w-4" />
                    Transcription
                  </h3>
                  
                  {(manualSubtitles.length > 0 || autoCaptions.length > 0) ? (
                    <div className="space-y-4">
                      {/* Manual Subtitles Section */}
                      {manualSubtitles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Creator Subtitles ({manualSubtitles.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {manualSubtitles.map((lang) => (
                              <Button
                                key={`manual-${lang}`}
                                variant={selectedLanguage === lang && selectedSource === 'manual' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => loadSubtitles(lang, 'manual')}
                                disabled={isLoadingSubtitles}
                              >
                                {isLoadingSubtitles && selectedLanguage === lang && selectedSource === 'manual' ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : null}
                                {getLanguageName(lang)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Auto-Captions Section */}
                      {autoCaptions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-primary flex items-center gap-1">
                            <Languages className="h-3 w-3" />
                            Auto-Generated (Original Language)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {autoCaptions.map((lang) => (
                              <Button
                                key={`auto-${lang}`}
                                variant={selectedLanguage === lang && selectedSource === 'auto' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => loadSubtitles(lang, 'auto')}
                                disabled={isLoadingSubtitles}
                              >
                                {isLoadingSubtitles && selectedLanguage === lang && selectedSource === 'auto' ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : null}
                                {getLanguageName(lang)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Status message */}
                      {transcriptSource && segments.length > 0 && (
                        <div className={`flex items-center gap-2 mt-2 ${
                          transcriptSource === 'youtube-manual' ? 'text-green-600' : 'text-primary'
                        }`}>
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">
                            Loaded {segments.length} segments from {transcriptSource === 'youtube-manual' ? 'creator subtitles' : 'auto-captions'} ({getLanguageName(selectedLanguage || '')})
                          </span>
                        </div>
                      )}
                      
                      {/* Translation Section - Appears after transcript is loaded */}
                      {transcript && segments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-dashed space-y-3">
                          <h4 className="font-semibold flex items-center gap-2 text-primary">
                            <Globe className="h-4 w-4" />
                            Translate to Another Language
                          </h4>
                          
                          {/* Translation Status */}
                          {translatedLanguage && (
                            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">
                                  Active: <span className="text-primary">{TRANSLATION_LANGUAGES[translatedLanguage] || translatedLanguage}</span>
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  (AI Translated from {getLanguageName(selectedLanguage || '')})
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearTranslation}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                Use Original
                              </Button>
                            </div>
                          )}
                          
                          {/* Translation Controls */}
                          {!translatedLanguage && (
                            <div className="flex items-center gap-3">
                              <p className="text-sm text-muted-foreground">
                                Translate transcript to:
                              </p>
                              <select
                                value={targetLanguage}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                className="flex-1 max-w-[200px] h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                disabled={isTranslating}
                              >
                                {Object.entries(TRANSLATION_LANGUAGES)
                                  .filter(([code]) => code !== selectedLanguage)
                                  .map(([code, name]) => (
                                    <option key={code} value={code}>{name}</option>
                                  ))
                                }
                              </select>
                              <Button
                                onClick={handleTranslate}
                                disabled={isTranslating || targetLanguage === selectedLanguage}
                                size="sm"
                              >
                                {isTranslating ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Translating...
                                  </>
                                ) : (
                                  <>
                                    <Globe className="h-4 w-4 mr-2" />
                                    Translate
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                          
                          {/* Translation Error */}
                          {translationError && (
                            <div className="flex items-center gap-2 text-red-500 text-sm">
                              <AlertCircle className="h-4 w-4" />
                              {translationError}
                            </div>
                          )}
                          
                          {/* Info about translation */}
                          <p className="text-xs text-muted-foreground">
                            <Sparkles className="h-3 w-3 inline mr-1" />
                            AI translation will be used for all learning tools (Summary, Flashcards, Quiz, etc.)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">No subtitles available for this video</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Would you like to generate a transcript using AI? This requires downloading the audio.
                      </p>
                      <Button
                        onClick={handleTranscribe}
                        disabled={isTranscribing || (!videoSrc && !currentUrl)}
                        variant="secondary"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate AI Transcript
                          </>
                        )}
                      </Button>
                      {!videoSrc && currentUrl && (
                        <p className="text-xs text-muted-foreground">
                          AI will fetch the audio stream from YouTube for transcription.
                        </p>
                      )}
                      {!videoSrc && !currentUrl && (
                        <p className="text-xs text-muted-foreground">
                          Upload the video file first to enable AI transcription.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Learning Interface */}
      {(videoSrc || youtubeInfo) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Video + Controls */}
          <div className="space-y-4">
            {/* Video Player */}
            <Card className="overflow-hidden">
              <div className="relative bg-black aspect-video">
                {videoSrc ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      className="w-full h-full"
                      onClick={togglePlay}
                    />
                    
                    {/* Play overlay */}
                    {!isPlaying && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                        onClick={togglePlay}
                      >
                        <div className="p-4 rounded-full bg-white/20 backdrop-blur">
                          <Play className="h-12 w-12 text-white" fill="white" />
                        </div>
                      </div>
                    )}
                  </>
                ) : youtubeInfo ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
                    <img
                      src={youtubeInfo.thumbnail}
                      alt={youtubeInfo.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                    <div className="relative z-10 text-center p-6">
                      <p className="text-white/80 text-lg mb-2">YouTube video loaded</p>
                      <p className="text-white/60 text-sm">
                        Upload the video file to enable playback,<br/>
                        or use the AI tools with available subtitles
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Controls */}
              <div className="p-4 space-y-3">
                {/* Progress bar */}
                <div 
                  className="relative h-2 bg-muted rounded-full cursor-pointer group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    handleSeek(percent * duration);
                  }}
                >
                  <div 
                    className="absolute h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div 
                    className="absolute h-4 w-4 bg-primary rounded-full -top-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
                  />
                </div>

                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => skip(-10)}>
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={togglePlay}>
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => skip(10)}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground ml-2">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => videoRef.current?.requestFullscreen()}
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Video Title */}
            {videoTitle && (
              <div className="px-1">
                <h2 className="font-semibold text-lg">{videoTitle}</h2>
              </div>
            )}

            {/* Transcribe Button */}
            {!transcript && (
              <Button 
                onClick={handleTranscribe} 
                disabled={isTranscribing}
                className="w-full"
                size="lg"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Transcribing with AI...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Transcribe Video
                  </>
                )}
              </Button>
            )}

            {transcribeError && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                {transcribeError}
              </div>
            )}

            {/* Transcription Progress */}
            {isTranscribing && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Transcribing with Groq Whisper</p>
                      <p className="text-sm text-muted-foreground">This usually takes 10-30 seconds...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Summary (shown after transcript) */}
            {activeTranscript && (
              <AISummary transcript={activeTranscript} videoTitle={videoTitle} />
            )}
          </div>

          {/* Right Column: Learning Tools */}
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="transcript" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Transcript</span>
                </TabsTrigger>
                <TabsTrigger value="flashcards" className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">Cards</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" />
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="tutor" className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Tutor</span>
                </TabsTrigger>
                <TabsTrigger value="guide" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Guide</span>
                </TabsTrigger>
              </TabsList>

              {/* Active Language Indicator */}
              {activeLanguage && (
                <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-muted/50 rounded-md text-sm">
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Learning in:</span>
                  <span className="font-medium">
                    {translatedLanguage 
                      ? `${TRANSLATION_LANGUAGES[translatedLanguage] || translatedLanguage} (Translated)` 
                      : getLanguageName(selectedLanguage || '')
                    }
                  </span>
                </div>
              )}

              <div className="mt-4 min-h-[500px]">
                <TabsContent value="transcript" className="mt-0 h-full">
                  {/* Language selector for transcript */}
                  {youtubeInfo && (manualSubtitles.length > 0 || autoCaptions.length > 0) && (
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg space-y-3">
                      {/* Manual Subtitles */}
                      {manualSubtitles.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2 mr-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-xs font-medium text-green-600">Creator:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {manualSubtitles.map((lang) => (
                              <Button
                                key={`manual-${lang}`}
                                variant={selectedLanguage === lang && selectedSource === 'manual' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => loadSubtitles(lang, 'manual')}
                                disabled={isLoadingSubtitles}
                              >
                                {isLoadingSubtitles && selectedLanguage === lang && selectedSource === 'manual' ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : null}
                                {getLanguageName(lang)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Auto-Captions */}
                      {autoCaptions.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2 mr-2">
                            <Languages className="h-4 w-4 text-primary" />
                            <span className="text-xs font-medium text-primary">Auto (Original):</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {autoCaptions.map((lang) => (
                              <Button
                                key={`auto-${lang}`}
                                variant={selectedLanguage === lang && selectedSource === 'auto' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => loadSubtitles(lang, 'auto')}
                                disabled={isLoadingSubtitles}
                              >
                                {isLoadingSubtitles && selectedLanguage === lang && selectedSource === 'auto' ? (
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                ) : null}
                                {getLanguageName(lang)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {transcriptSource && selectedLanguage && (
                        <p className={`text-xs mt-2 ${
                          transcriptSource === 'youtube-manual' ? 'text-green-600' : 'text-primary'
                        }`}>
                          Showing {transcriptSource === 'youtube-manual' ? 'creator subtitles' : 'auto-generated captions'} in {getLanguageName(selectedLanguage)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* No subtitles available message */}
                  {youtubeInfo && manualSubtitles.length === 0 && autoCaptions.length === 0 && segments.length === 0 && (
                    <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-medium text-amber-600">No subtitles available</p>
                          <p className="text-sm text-muted-foreground">
                            This video doesn't have subtitles on YouTube. You can generate a transcript using AI from the YouTube audio stream.
                          </p>
                          <Button
                            onClick={handleTranscribe}
                            disabled={isTranscribing || (!videoSrc && !currentUrl)}
                            size="sm"
                            className="mt-2"
                          >
                            {isTranscribing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Transcribing with AI...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate AI Transcript
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {transcriptSource === 'ai' && (
                    <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium text-purple-600">AI-Generated Transcript</span>
                      </div>
                    </div>
                  )}
                  
                  <InteractiveTranscript
                    segments={activeSegments}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                  />
                </TabsContent>

                <TabsContent value="flashcards" className="mt-0">
                  <FlashcardViewer transcript={activeTranscript} videoTitle={videoTitle} />
                </TabsContent>

                <TabsContent value="quiz" className="mt-0">
                  <QuizComponent transcript={activeTranscript} videoTitle={videoTitle} />
                </TabsContent>

                <TabsContent value="tutor" className="mt-0 h-[500px]">
                  <AITutorChat 
                    transcript={activeTranscript} 
                    videoTitle={videoTitle}
                    segments={activeSegments}
                    currentTime={currentTime}
                    onSeek={handleSeek}
                  />
                </TabsContent>

                <TabsContent value="guide" className="mt-0">
                  <StudyGuidePanel transcript={activeTranscript} videoTitle={videoTitle} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}

// Study Guide Panel Component
function StudyGuidePanel({ transcript, videoTitle }: { transcript: string; videoTitle?: string }) {
  const [studyGuide, setStudyGuide] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateGuide = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, videoTitle }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate study guide');
      }

      setStudyGuide(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate study guide');
    } finally {
      setIsLoading(false);
    }
  };

  if (!transcript) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Transcribe the video first to generate a study guide.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            Study Guide
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!studyGuide && !isLoading && (
          <Button onClick={generateGuide} className="w-full" size="lg">
            <BookOpen className="h-4 w-4 mr-2" />
            Generate Study Guide
          </Button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Creating comprehensive study guide...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {studyGuide && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">{studyGuide.title}</h3>
              <p className="text-muted-foreground mt-1">{studyGuide.overview}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">🎯 Learning Objectives</h4>
              <ul className="space-y-1">
                {studyGuide.learningObjectives?.map((obj: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">📚 Key Concepts</h4>
              <div className="space-y-3">
                {studyGuide.keyConcepts?.map((concept: any, i: number) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{concept.term}</p>
                    <p className="text-sm text-muted-foreground mt-1">{concept.definition}</p>
                    {concept.examples?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Examples: {concept.examples.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">📝 Summary</h4>
              <p className="text-sm">{studyGuide.summary}</p>
            </div>

            <div>
              <h4 className="font-medium mb-2">❓ Review Questions</h4>
              <ul className="space-y-2">
                {studyGuide.reviewQuestions?.map((q: string, i: number) => (
                  <li key={i} className="text-sm p-2 bg-muted/30 rounded">
                    {i + 1}. {q}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
