// AI Services - Central Export
// All AI-related functionality for the learning suite

// Configuration
export { 
  getGeminiClient, 
  getGeminiFlash, 
  getGeminiPro, 
  getGroqClient,
  checkAIConfiguration 
} from './config';

// Transcription (Groq Whisper)
export { 
  transcribeAudio, 
  transcribeFromUrl,
  formatTimestamp,
  toSRT,
  toVTT,
  type TranscriptSegment,
  type WordTimestamp,
  type TranscriptionResult,
  type TranscriptionOptions,
} from './transcription';

// Gemini AI Features
export {
  // Summary
  generateSummary,
  generateTLDR,
  type Summary,
  type SummaryLength,
  
  // Flashcards
  generateFlashcards,
  type Flashcard,
  
  // Quiz
  generateQuiz,
  gradeShortAnswer,
  type QuizQuestion,
  
  // Study Guide
  generateStudyGuide,
  type StudyGuide,
  
  // AI Tutor
  chatWithTutor,
  explainTimestamp,
  type ChatMessage,
  
  // Key Concepts
  extractKeyConcepts,
  
  // Translation
  translateTranscript,
  translateToMultipleLanguages,
  TRANSLATION_LANGUAGES,
  type TranslationLanguageCode,
  type TranslationResult,
} from './gemini';

// React Hooks
export {
  useTranscription,
  useSummary,
  useFlashcards,
  useQuiz,
  useStudyGuide,
  useAITutor,
} from './hooks';
