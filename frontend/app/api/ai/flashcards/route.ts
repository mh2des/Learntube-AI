// POST /api/ai/flashcards - Generate flashcards using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, count = 10, videoTitle } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (transcript.length < 100) {
      return NextResponse.json(
        { error: 'Transcript is too short to generate meaningful flashcards' },
        { status: 400 }
      );
    }

    // Limit flashcard count
    const flashcardCount = Math.min(Math.max(count, 5), 30);

    const flashcards = await generateFlashcards(transcript, flashcardCount, videoTitle);

    return NextResponse.json({
      success: true,
      data: { flashcards },
    });
  } catch (error) {
    console.error('Flashcards API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Flashcard generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
