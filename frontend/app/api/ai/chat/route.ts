// POST /api/ai/chat - AI Tutor chat interface
import { NextRequest, NextResponse } from 'next/server';
import { chatWithTutor, explainTimestamp, extractKeyConcepts, type ChatMessage } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action = 'chat', // 'chat', 'explain', 'concepts'
      transcript, 
      videoTitle,
      // For chat
      messages = [],
      question,
      // For explain
      timestamp,
      segments,
      style = 'simple',
    } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Extract key concepts
    if (action === 'concepts') {
      const concepts = await extractKeyConcepts(transcript, videoTitle);
      return NextResponse.json({
        success: true,
        data: { concepts },
      });
    }

    // Explain specific timestamp
    if (action === 'explain') {
      if (timestamp === undefined || !segments) {
        return NextResponse.json(
          { error: 'Timestamp and segments are required for explanation' },
          { status: 400 }
        );
      }

      const explanation = await explainTimestamp(transcript, timestamp, segments, style);
      return NextResponse.json({
        success: true,
        data: { explanation },
      });
    }

    // Chat with tutor
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required for chat' },
        { status: 400 }
      );
    }

    const response = await chatWithTutor(
      transcript, 
      messages as ChatMessage[], 
      question, 
      videoTitle
    );

    return NextResponse.json({
      success: true,
      data: { response },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Chat failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
