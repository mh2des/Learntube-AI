// POST /api/ai/translate - Translate transcript using Gemini
import { NextRequest, NextResponse } from 'next/server';
import { translateTranscript, TRANSLATION_LANGUAGES, type TranslationLanguageCode } from '@/lib/ai/gemini';

export const runtime = 'nodejs';
export const maxDuration = 120; // Translation can take longer

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      content, 
      targetLanguage, 
      sourceLanguage, 
      videoTitle 
    } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content (transcript/subtitle) is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: 'Target language is required' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length < 20) {
      return NextResponse.json(
        { error: 'Content is too short to translate' },
        { status: 400 }
      );
    }

    // Check if target language is supported
    const supportedLanguages = Object.keys(TRANSLATION_LANGUAGES);
    if (!supportedLanguages.includes(targetLanguage)) {
      return NextResponse.json(
        { 
          error: `Unsupported target language. Supported: ${supportedLanguages.join(', ')}`,
          supportedLanguages 
        },
        { status: 400 }
      );
    }

    // Perform translation
    const result = await translateTranscript(
      content,
      targetLanguage,
      sourceLanguage,
      videoTitle
    );

    return NextResponse.json({
      success: true,
      data: {
        sourceLanguage: result.sourceLanguage,
        targetLanguage: result.targetLanguage,
        targetLanguageCode: targetLanguage,
        translatedContent: result.translatedContent,
        segmentCount: result.segmentCount,
      },
    });
  } catch (error) {
    console.error('Translation API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('API key')) {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: `Translation failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET endpoint to list available languages
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      languages: TRANSLATION_LANGUAGES,
      count: Object.keys(TRANSLATION_LANGUAGES).length,
    },
  });
}
