// POST /api/ai/quiz - Generate quiz questions using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { generateQuiz, gradeShortAnswer } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      transcript, 
      questionCount = 10, 
      difficulty = 'mixed', 
      videoTitle,
      action = 'generate' // 'generate' or 'grade'
    } = body;

    // Grade short answer
    if (action === 'grade') {
      const { question, correctAnswer, userAnswer } = body;
      
      if (!question || !correctAnswer || !userAnswer) {
        return NextResponse.json(
          { error: 'Question, correctAnswer, and userAnswer are required for grading' },
          { status: 400 }
        );
      }

      const result = await gradeShortAnswer(question, correctAnswer, userAnswer);
      
      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Generate quiz
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (transcript.length < 100) {
      return NextResponse.json(
        { error: 'Transcript is too short to generate meaningful questions' },
        { status: 400 }
      );
    }

    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard', 'mixed'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be: easy, medium, hard, or mixed' },
        { status: 400 }
      );
    }

    // Limit question count
    const count = Math.min(Math.max(questionCount, 3), 20);

    const questions = await generateQuiz(transcript, count, difficulty, videoTitle);

    return NextResponse.json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    console.error('Quiz API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: `Quiz generation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
