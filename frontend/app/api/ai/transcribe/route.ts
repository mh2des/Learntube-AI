// POST /api/ai/transcribe - Transcribe audio using Groq Whisper
import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient } from '@/lib/ai/config';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for long videos

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = formData.get('language') as string | undefined;
    const prompt = formData.get('prompt') as string | undefined;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB for Groq)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 25MB.' },
        { status: 400 }
      );
    }

    const groq = getGroqClient();

    // Call Groq Whisper API
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      temperature: 0,
      language: language || undefined,
      prompt: prompt || undefined,
      timestamp_granularities: ['word', 'segment'],
    });

    // Parse the verbose response
    const result = transcription as unknown as {
      text: string;
      segments: Array<{
        id: number;
        start: number;
        end: number;
        text: string;
        words?: Array<{ word: string; start: number; end: number }>;
        speaker?: string;
      }>;
      language: string;
      duration: number;
    };

    return NextResponse.json({
      success: true,
      data: {
        text: result.text,
        segments: result.segments?.map((seg) => ({
          id: seg.id,
          start: seg.start,
          end: seg.end,
          text: seg.text.trim(),
          words: seg.words,
          speaker: seg.speaker || 'Speaker 1',
        })) || [],
        language: result.language,
        duration: result.duration,
      },
    });
  } catch (error) {
    console.error('Transcription API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check for specific Groq errors
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 401 }
      );
    }
    
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Transcription failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
