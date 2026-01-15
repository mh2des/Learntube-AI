// POST /api/ai/study-guide - Generate comprehensive study guide
import { NextRequest, NextResponse } from 'next/server';
import { generateStudyGuide } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 90; // Study guides take longer

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, videoTitle } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (transcript.length < 200) {
      return NextResponse.json(
        { error: 'Transcript is too short to generate a meaningful study guide' },
        { status: 400 }
      );
    }

    const studyGuide = await generateStudyGuide(transcript, videoTitle);

    return NextResponse.json({
      success: true,
      data: studyGuide,
    });
  } catch (error) {
    console.error('Study Guide API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Study guide generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
