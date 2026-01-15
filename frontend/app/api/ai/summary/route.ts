// POST /api/ai/summary - Generate AI summary using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { generateSummary, generateTLDR, type SummaryLength } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, length = 'standard', videoTitle, tldr = false } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (transcript.length < 50) {
      return NextResponse.json(
        { error: 'Transcript is too short' },
        { status: 400 }
      );
    }

    // Generate TL;DR if requested
    if (tldr) {
      const tldrText = await generateTLDR(transcript);
      return NextResponse.json({
        success: true,
        data: { tldr: tldrText },
      });
    }

    // Validate length parameter
    const validLengths: SummaryLength[] = ['brief', 'standard', 'detailed'];
    if (!validLengths.includes(length)) {
      return NextResponse.json(
        { error: 'Invalid length. Must be: brief, standard, or detailed' },
        { status: 400 }
      );
    }

    const summary = await generateSummary(transcript, length, videoTitle);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Summary API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `Summary generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
