// Transcription Service using Groq Whisper API
// Ultra-fast transcription with word-level timestamps

import { getGroqClient } from './config';

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  duration: number;
}

export interface TranscriptionOptions {
  language?: string; // ISO-639-1 code (e.g., 'en', 'es', 'ar')
  prompt?: string; // Context hint for better accuracy
  temperature?: number; // 0-1, lower = more deterministic
  responseFormat?: 'json' | 'verbose_json' | 'text' | 'srt' | 'vtt';
}

/**
 * Transcribe audio using Groq's Whisper Large V3 model
 * 10x faster than real-time with 99%+ accuracy
 */
export async function transcribeAudio(
  audioFile: File,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const groq = getGroqClient();
  
  const {
    language,
    prompt,
    temperature = 0,
  } = options;

  try {
    // Use Groq's transcription endpoint with verbose_json for segments
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      temperature,
      language,
      prompt,
    });

    // Parse verbose_json response for segments
    const verboseResult = transcription as unknown as {
      text: string;
      segments: Array<{
          id: number;
          start: number;
          end: number;
          text: string;
          words?: Array<{ word: string; start: number; end: number }>;
        }>;
        language: string;
        duration: number;
      };

    return {
      text: verboseResult.text,
      segments: verboseResult.segments?.map((seg) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
        words: seg.words?.map((w) => ({
          word: w.word,
          start: w.start,
          end: w.end,
        })),
      })) || [],
      language: verboseResult.language || 'en',
      duration: verboseResult.duration || 0,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Transcribe from a URL (downloads and transcribes)
 */
export async function transcribeFromUrl(
  audioUrl: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  // Fetch the audio file
  const response = await fetch(audioUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.statusText}`);
  }
  
  const blob = await response.blob();
  // Convert Blob to File for Groq API
  const file = new File([blob], 'audio.mp4', { type: blob.type || 'audio/mpeg' });
  return transcribeAudio(file, options);
}

/**
 * Format seconds to timestamp string (HH:MM:SS or MM:SS)
 */
export function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Export transcript to SRT format
 */
export function toSRT(segments: TranscriptSegment[]): string {
  return segments.map((seg, index) => {
    const start = formatSRTTimestamp(seg.start);
    const end = formatSRTTimestamp(seg.end);
    return `${index + 1}\n${start} --> ${end}\n${seg.text}\n`;
  }).join('\n');
}

/**
 * Export transcript to VTT format
 */
export function toVTT(segments: TranscriptSegment[]): string {
  const header = 'WEBVTT\n\n';
  const cues = segments.map((seg) => {
    const start = formatVTTTimestamp(seg.start);
    const end = formatVTTTimestamp(seg.end);
    return `${start} --> ${end}\n${seg.text}\n`;
  }).join('\n');
  return header + cues;
}

function formatSRTTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function formatVTTTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}
