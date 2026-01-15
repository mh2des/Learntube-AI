// AI Service Configuration
// Centralized AI client initialization with proper error handling

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Singleton instances
let geminiClient: GoogleGenerativeAI | null = null;
let groqClient: Groq | null = null;

// Gemini Models
let geminiFlash: GenerativeModel | null = null;
let geminiPro: GenerativeModel | null = null;

/**
 * Initialize Gemini AI client
 * Uses Gemini 1.5 Flash for fast operations, Pro for complex reasoning
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

/**
 * Get Gemini Flash model (fast, efficient for summaries)
 */
export function getGeminiFlash(): GenerativeModel {
  if (!geminiFlash) {
    geminiFlash = getGeminiClient().getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
  }
  return geminiFlash;
}

/**
 * Get Gemini Pro model (complex reasoning for study guides, quizzes)
 */
export function getGeminiPro(): GenerativeModel {
  if (!geminiPro) {
    geminiPro = getGeminiClient().getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.8,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
  }
  return geminiPro;
}

/**
 * Initialize Groq client for Whisper transcription
 */
export function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured in environment variables');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Check if AI services are properly configured
 */
export function checkAIConfiguration(): { gemini: boolean; groq: boolean } {
  return {
    gemini: !!process.env.GEMINI_API_KEY,
    groq: !!process.env.GROQ_API_KEY,
  };
}
