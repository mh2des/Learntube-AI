// Gemini AI Service for Learning Features
// Summaries, Flashcards, Quizzes, AI Tutor

import { getGeminiFlash, getGeminiPro } from './config';

// ============================================
// TYPES
// ============================================

export type SummaryLength = 'brief' | 'standard' | 'detailed';

export interface Summary {
  length: SummaryLength;
  text: string;
  keyPoints: string[];
  wordCount: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'definition' | 'concept' | 'fact' | 'qa';
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp?: number; // Reference to video timestamp
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timestamp?: number;
}

export interface StudyGuide {
  title: string;
  overview: string;
  learningObjectives: string[];
  keyConcepts: Array<{
    term: string;
    definition: string;
    examples?: string[];
  }>;
  summary: string;
  reviewQuestions: string[];
  furtherReading?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number; // Reference to video timestamp
}

// ============================================
// PROMPTS
// ============================================

const SYSTEM_CONTEXT = `You are an expert educational AI assistant helping users learn from video content. 
You provide clear, accurate, and helpful responses. 
When referencing specific parts of the content, mention timestamps when available.
Be concise but thorough. Use markdown formatting for better readability.`;

const SUMMARY_PROMPTS: Record<SummaryLength, string> = {
  brief: `Provide a brief summary (2-3 sentences) of the main idea of this transcript. Also list 3-5 key points as bullet points.`,
  standard: `Provide a comprehensive summary (1-2 paragraphs) of this transcript. Cover the main topics, key arguments, and conclusions. Also list 5-7 key points as bullet points.`,
  detailed: `Provide a detailed summary (3-4 paragraphs) of this transcript. Include:
1. Main thesis/purpose
2. Key arguments and evidence
3. Important examples or case studies
4. Conclusions and takeaways
Also list 8-10 key points as bullet points with brief explanations.`,
};

// ============================================
// SUMMARY SERVICE
// ============================================

/**
 * Generate an AI summary of the transcript
 */
export async function generateSummary(
  transcript: string,
  length: SummaryLength = 'standard',
  videoTitle?: string
): Promise<Summary> {
  const model = getGeminiFlash();
  
  const prompt = `${SYSTEM_CONTEXT}

${videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}Transcript:
${transcript}

${SUMMARY_PROMPTS[length]}

Respond in JSON format:
{
  "summary": "your summary text here",
  "keyPoints": ["point 1", "point 2", ...]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      length,
      text: parsed.summary,
      keyPoints: parsed.keyPoints,
      wordCount: parsed.summary.split(/\s+/).length,
    };
  } catch (error) {
    console.error('Summary generation error:', error);
    throw new Error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate TL;DR (1-2 sentences)
 */
export async function generateTLDR(transcript: string): Promise<string> {
  const model = getGeminiFlash();
  
  const prompt = `${SYSTEM_CONTEXT}

Transcript:
${transcript}

Provide a TL;DR summary in 1-2 sentences. Just the essence of what this video is about.
Respond with only the TL;DR text, no additional formatting.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ============================================
// FLASHCARD SERVICE
// ============================================

/**
 * Generate flashcards from transcript
 */
export async function generateFlashcards(
  transcript: string,
  count: number = 10,
  videoTitle?: string
): Promise<Flashcard[]> {
  const model = getGeminiPro();
  
  const prompt = `${SYSTEM_CONTEXT}

${videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}Transcript:
${transcript}

Generate ${count} high-quality flashcards for studying this content. Include a mix of:
- Definitions of key terms
- Important concepts
- Key facts
- Q&A pairs

For each flashcard, assess the difficulty (easy, medium, hard).

Respond in JSON format:
{
  "flashcards": [
    {
      "front": "question or term",
      "back": "answer or definition",
      "type": "definition|concept|fact|qa",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return parsed.flashcards.map((card: Omit<Flashcard, 'id'>, index: number) => ({
      ...card,
      id: `fc-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error('Flashcard generation error:', error);
    throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// QUIZ SERVICE
// ============================================

/**
 * Generate quiz questions from transcript
 */
export async function generateQuiz(
  transcript: string,
  questionCount: number = 10,
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed',
  videoTitle?: string
): Promise<QuizQuestion[]> {
  const model = getGeminiPro();
  
  const difficultyInstruction = difficulty === 'mixed' 
    ? 'Include a mix of easy, medium, and hard questions.'
    : `All questions should be ${difficulty} difficulty.`;
  
  const prompt = `${SYSTEM_CONTEXT}

${videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}Transcript:
${transcript}

Generate ${questionCount} quiz questions to test understanding of this content.
${difficultyInstruction}

Include a variety of question types:
- Multiple choice (4 options, 1 correct)
- True/False
- Fill in the blank

For each question, provide the correct answer and a brief explanation.

Respond in JSON format:
{
  "questions": [
    {
      "type": "multiple-choice|true-false|fill-blank",
      "question": "the question text",
      "options": ["A", "B", "C", "D"], // only for multiple-choice
      "correctAnswer": "the correct answer",
      "explanation": "why this is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return parsed.questions.map((q: Omit<QuizQuestion, 'id'>, index: number) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error('Quiz generation error:', error);
    throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Grade a short answer question using AI
 */
export async function gradeShortAnswer(
  question: string,
  correctAnswer: string,
  userAnswer: string
): Promise<{ score: number; feedback: string }> {
  const model = getGeminiFlash();
  
  const prompt = `You are grading a student's answer to a question.

Question: ${question}
Expected Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

Grade the student's answer on a scale of 0-100 based on accuracy and completeness.
Provide brief feedback.

Respond in JSON format:
{
  "score": 85,
  "feedback": "Your feedback here"
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { score: 0, feedback: 'Unable to grade response' };
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Grading error:', error);
    return { score: 0, feedback: 'Error grading response' };
  }
}

// ============================================
// STUDY GUIDE SERVICE
// ============================================

/**
 * Generate a comprehensive study guide
 */
export async function generateStudyGuide(
  transcript: string,
  videoTitle?: string
): Promise<StudyGuide> {
  const model = getGeminiPro();
  
  const prompt = `${SYSTEM_CONTEXT}

${videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}Transcript:
${transcript}

Create a comprehensive study guide for this content. Include:
1. A descriptive title
2. A brief overview (2-3 sentences)
3. 3-5 clear learning objectives
4. Key concepts with definitions and examples
5. A comprehensive summary
6. 5-7 review questions for self-assessment
7. Suggestions for further reading/learning (optional)

Respond in JSON format:
{
  "title": "Study Guide Title",
  "overview": "Brief overview of the content",
  "learningObjectives": ["objective 1", "objective 2"],
  "keyConcepts": [
    {
      "term": "concept name",
      "definition": "clear definition",
      "examples": ["example 1", "example 2"]
    }
  ],
  "summary": "Comprehensive summary",
  "reviewQuestions": ["question 1", "question 2"],
  "furtherReading": ["resource 1", "resource 2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Study guide generation error:', error);
    throw new Error(`Failed to generate study guide: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// AI TUTOR (CHAT) SERVICE
// ============================================

/**
 * Chat with AI tutor about video content
 */
export async function chatWithTutor(
  transcript: string,
  messages: ChatMessage[],
  userQuestion: string,
  videoTitle?: string
): Promise<string> {
  const model = getGeminiFlash();
  
  // Build conversation history
  const history = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n\n');
  
  const prompt = `${SYSTEM_CONTEXT}

You are tutoring a student about this video content. Answer their questions helpfully.
When relevant, reference specific parts of the transcript to support your answers.

${videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}Transcript:
${transcript}

${history ? `Previous conversation:\n${history}\n\n` : ''}User's question: ${userQuestion}

Provide a helpful, clear response. Use markdown formatting. If the question is unrelated to the video content, politely redirect to the video topic.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Chat error:', error);
    throw new Error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Explain a specific part of the video (timestamp-based)
 */
export async function explainTimestamp(
  transcript: string,
  timestamp: number,
  segments: Array<{ start: number; end: number; text: string }>,
  style: 'simple' | 'technical' | 'examples' = 'simple'
): Promise<string> {
  const model = getGeminiFlash();
  
  // Find the relevant segment(s) around the timestamp
  const relevantSegments = segments.filter(
    s => s.start <= timestamp + 30 && s.end >= timestamp - 10
  );
  const contextText = relevantSegments.map(s => s.text).join(' ');
  
  const styleInstructions: Record<string, string> = {
    simple: 'Explain this like you\'re teaching a beginner. Use simple language and analogies.',
    technical: 'Provide a technical deep-dive with precise terminology and detailed explanations.',
    examples: 'Focus on real-world examples and practical applications to illustrate the concepts.',
  };
  
  const prompt = `${SYSTEM_CONTEXT}

At timestamp ${Math.floor(timestamp / 60)}:${Math.floor(timestamp % 60).toString().padStart(2, '0')}, the video discusses:

"${contextText}"

${styleInstructions[style]}

Provide a clear explanation.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Explanation error:', error);
    throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================
// TRANSLATION SERVICE
// ============================================

// Supported languages for translation with their display names
export const TRANSLATION_LANGUAGES = {
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
} as const;

export type TranslationLanguageCode = keyof typeof TRANSLATION_LANGUAGES;

export interface TranslationResult {
  sourceLanguage: string;
  targetLanguage: string;
  originalContent: string;
  translatedContent: string;
  segmentCount: number;
}

/**
 * Translate VTT/SRT subtitle content to another language using Gemini
 * Preserves timestamps and formatting while translating the spoken text
 */
export async function translateTranscript(
  content: string,
  targetLanguage: string,
  sourceLanguage?: string,
  videoTitle?: string
): Promise<TranslationResult> {
  const model = getGeminiFlash();
  
  const targetLangName = TRANSLATION_LANGUAGES[targetLanguage as TranslationLanguageCode] || targetLanguage;
  const sourceLangName = sourceLanguage 
    ? (TRANSLATION_LANGUAGES[sourceLanguage as TranslationLanguageCode] || sourceLanguage)
    : 'auto-detected';
  
  const prompt = `You are a professional translator specializing in video subtitles.

TASK: Translate the following subtitle file content from ${sourceLangName} to ${targetLangName}.

${videoTitle ? `VIDEO CONTEXT: "${videoTitle}"\n` : ''}

CRITICAL RULES:
1. KEEP ALL TIMESTAMPS EXACTLY AS THEY ARE (e.g., 00:00:01.000 --> 00:00:05.000)
2. KEEP the "WEBVTT" header and any cue identifiers intact
3. ONLY translate the spoken text content
4. Maintain natural sentence flow in ${targetLangName}
5. Preserve any speaker labels (e.g., "[Music]", "[Applause]")
6. Be a LITERAL translator - do not add, remove, or rephrase beyond what's needed for natural translation
7. If there are technical terms, translate them appropriately for the ${targetLangName}-speaking audience

INPUT SUBTITLE CONTENT:
${content}

OUTPUT: The complete translated subtitle file (VTT format). Do not add any explanations or markdown code blocks - just output the raw VTT content.`;

  try {
    const result = await model.generateContent(prompt);
    let translatedContent = result.response.text().trim();
    
    // Clean up response - remove any markdown code blocks if present
    if (translatedContent.startsWith('```')) {
      translatedContent = translatedContent.replace(/^```(?:vtt|srt)?\n?/, '').replace(/\n?```$/, '');
    }
    
    // Ensure it starts with WEBVTT if the original did
    if (content.trim().startsWith('WEBVTT') && !translatedContent.startsWith('WEBVTT')) {
      translatedContent = 'WEBVTT\n\n' + translatedContent;
    }
    
    // Count segments (approximate by counting timestamp lines)
    const segmentCount = (translatedContent.match(/-->/g) || []).length;
    
    return {
      sourceLanguage: sourceLangName,
      targetLanguage: targetLangName,
      originalContent: content,
      translatedContent,
      segmentCount,
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Failed to translate: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Batch translate to multiple languages (with progress callback)
 */
export async function translateToMultipleLanguages(
  content: string,
  targetLanguages: string[],
  sourceLanguage?: string,
  videoTitle?: string,
  onProgress?: (completed: number, total: number, currentLang: string) => void
): Promise<Map<string, TranslationResult>> {
  const results = new Map<string, TranslationResult>();
  
  for (let i = 0; i < targetLanguages.length; i++) {
    const lang = targetLanguages[i];
    const langName = TRANSLATION_LANGUAGES[lang as TranslationLanguageCode] || lang;
    
    if (onProgress) {
      onProgress(i, targetLanguages.length, langName);
    }
    
    try {
      const result = await translateTranscript(content, lang, sourceLanguage, videoTitle);
      results.set(lang, result);
    } catch (error) {
      console.error(`Failed to translate to ${lang}:`, error);
      // Continue with other languages even if one fails
    }
  }
  
  if (onProgress) {
    onProgress(targetLanguages.length, targetLanguages.length, 'Complete');
  }
  
  return results;
}

// ============================================
// KEY CONCEPTS EXTRACTION
// ============================================

/**
 * Extract key terminology and concepts
 */
export async function extractKeyConcepts(
  transcript: string,
  videoTitle?: string
): Promise<Array<{ term: string; definition: string; importance: 'high' | 'medium' | 'low' }>> {
  const model = getGeminiFlash();
  
  const prompt = `${SYSTEM_CONTEXT}

${videoTitle ? `Video Title: ${videoTitle}\n\n` : ''}Transcript:
${transcript}

Extract the key terms and concepts from this content. For each:
1. Identify the term/concept
2. Provide a clear definition based on the context
3. Rate its importance (high, medium, low)

Respond in JSON format:
{
  "concepts": [
    {
      "term": "term name",
      "definition": "definition based on context",
      "importance": "high|medium|low"
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.concepts;
  } catch (error) {
    console.error('Concept extraction error:', error);
    throw new Error(`Failed to extract concepts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
