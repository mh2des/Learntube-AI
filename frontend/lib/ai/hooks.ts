// React Hooks for AI Learning Features
// Easy-to-use hooks for components

import { useState, useCallback } from 'react';
import type { 
  Summary, 
  SummaryLength, 
  Flashcard, 
  QuizQuestion, 
  StudyGuide,
  ChatMessage,
  TranscriptSegment,
} from './index';

// ============================================
// TRANSCRIPTION HOOK
// ============================================

interface UseTranscriptionResult {
  transcribe: (audioFile: File, options?: { language?: string; prompt?: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  result: {
    text: string;
    segments: TranscriptSegment[];
    language: string;
    duration: number;
  } | null;
  reset: () => void;
}

export function useTranscription(): UseTranscriptionResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UseTranscriptionResult['result']>(null);

  const transcribe = useCallback(async (
    audioFile: File, 
    options?: { language?: string; prompt?: string }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      if (options?.language) formData.append('language', options.language);
      if (options?.prompt) formData.append('prompt', options.prompt);

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { transcribe, isLoading, error, result, reset };
}

// ============================================
// SUMMARY HOOK
// ============================================

interface UseSummaryResult {
  generateSummary: (transcript: string, length?: SummaryLength, videoTitle?: string) => Promise<void>;
  generateTLDR: (transcript: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  summary: Summary | null;
  reset: () => void;
}

export function useSummary(): UseSummaryResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const generateSummary = useCallback(async (
    transcript: string, 
    length: SummaryLength = 'standard',
    videoTitle?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, length, videoTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Summary generation failed');
      }

      setSummary(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summary generation failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateTLDR = useCallback(async (transcript: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, tldr: true }),
      });

      const data = await response.json();
      return response.ok ? data.data.tldr : null;
    } catch {
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return { generateSummary, generateTLDR, isLoading, error, summary, reset };
}

// ============================================
// FLASHCARDS HOOK
// ============================================

interface UseFlashcardsResult {
  generate: (transcript: string, count?: number, videoTitle?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  flashcards: Flashcard[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  shuffle: () => void;
  reset: () => void;
}

export function useFlashcards(): UseFlashcardsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const generate = useCallback(async (
    transcript: string, 
    count: number = 10,
    videoTitle?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, count, videoTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Flashcard generation failed');
      }

      setFlashcards(data.data.flashcards);
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Flashcard generation failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const next = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, flashcards.length - 1));
  }, [flashcards.length]);

  const prev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  const shuffle = useCallback(() => {
    setFlashcards(cards => [...cards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  }, []);

  const reset = useCallback(() => {
    setFlashcards([]);
    setCurrentIndex(0);
    setError(null);
  }, []);

  return { 
    generate, 
    isLoading, 
    error, 
    flashcards, 
    currentIndex, 
    setCurrentIndex,
    next, 
    prev, 
    shuffle, 
    reset 
  };
}

// ============================================
// QUIZ HOOK
// ============================================

interface QuizState {
  currentQuestion: number;
  answers: Record<string, string>;
  score: number;
  completed: boolean;
}

interface UseQuizResult {
  generate: (transcript: string, count?: number, difficulty?: string, videoTitle?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  questions: QuizQuestion[];
  state: QuizState;
  answer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submit: () => void;
  reset: () => void;
}

export function useQuiz(): UseQuizResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [state, setState] = useState<QuizState>({
    currentQuestion: 0,
    answers: {},
    score: 0,
    completed: false,
  });

  const generate = useCallback(async (
    transcript: string, 
    questionCount: number = 10,
    difficulty: string = 'mixed',
    videoTitle?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, questionCount, difficulty, videoTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Quiz generation failed');
      }

      setQuestions(data.data.questions);
      setState({
        currentQuestion: 0,
        answers: {},
        score: 0,
        completed: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quiz generation failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const answer = useCallback((questionId: string, userAnswer: string) => {
    setState(s => ({
      ...s,
      answers: { ...s.answers, [questionId]: userAnswer },
    }));
  }, []);

  const nextQuestion = useCallback(() => {
    setState(s => ({
      ...s,
      currentQuestion: Math.min(s.currentQuestion + 1, questions.length - 1),
    }));
  }, [questions.length]);

  const prevQuestion = useCallback(() => {
    setState(s => ({
      ...s,
      currentQuestion: Math.max(s.currentQuestion - 1, 0),
    }));
  }, []);

  const submit = useCallback(() => {
    let score = 0;
    questions.forEach(q => {
      const userAnswer = state.answers[q.id];
      if (userAnswer?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
        score++;
      }
    });
    setState(s => ({
      ...s,
      score,
      completed: true,
    }));
  }, [questions, state.answers]);

  const reset = useCallback(() => {
    setQuestions([]);
    setState({
      currentQuestion: 0,
      answers: {},
      score: 0,
      completed: false,
    });
    setError(null);
  }, []);

  return { 
    generate, 
    isLoading, 
    error, 
    questions, 
    state, 
    answer, 
    nextQuestion, 
    prevQuestion, 
    submit, 
    reset 
  };
}

// ============================================
// STUDY GUIDE HOOK
// ============================================

interface UseStudyGuideResult {
  generate: (transcript: string, videoTitle?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  studyGuide: StudyGuide | null;
  reset: () => void;
}

export function useStudyGuide(): UseStudyGuideResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studyGuide, setStudyGuide] = useState<StudyGuide | null>(null);

  const generate = useCallback(async (transcript: string, videoTitle?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, videoTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Study guide generation failed');
      }

      setStudyGuide(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Study guide generation failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setStudyGuide(null);
    setError(null);
  }, []);

  return { generate, isLoading, error, studyGuide, reset };
}

// ============================================
// AI TUTOR CHAT HOOK
// ============================================

interface UseAITutorResult {
  sendMessage: (question: string) => Promise<void>;
  explain: (timestamp: number, segments: TranscriptSegment[], style?: 'simple' | 'technical' | 'examples') => Promise<string | null>;
  extractConcepts: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  messages: ChatMessage[];
  concepts: Array<{ term: string; definition: string; importance: string }>;
  clearChat: () => void;
}

export function useAITutor(transcript: string, videoTitle?: string): UseAITutorResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [concepts, setConcepts] = useState<Array<{ term: string; definition: string; importance: string }>>([]);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'chat',
          transcript, 
          videoTitle,
          messages: [...messages, userMessage],
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chat failed');
      }

      const assistantMessage: ChatMessage = { role: 'assistant', content: data.data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setIsLoading(false);
    }
  }, [transcript, videoTitle, messages]);

  const explain = useCallback(async (
    timestamp: number, 
    segments: TranscriptSegment[],
    style: 'simple' | 'technical' | 'examples' = 'simple'
  ): Promise<string | null> => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'explain',
          transcript, 
          timestamp,
          segments,
          style,
        }),
      });

      const data = await response.json();
      return response.ok ? data.data.explanation : null;
    } catch {
      return null;
    }
  }, [transcript]);

  const extractConcepts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'concepts',
          transcript, 
          videoTitle,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setConcepts(data.data.concepts);
      }
    } catch {
      // Silent fail for concepts
    } finally {
      setIsLoading(false);
    }
  }, [transcript, videoTitle]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { 
    sendMessage, 
    explain, 
    extractConcepts,
    isLoading, 
    error, 
    messages, 
    concepts,
    clearChat 
  };
}
