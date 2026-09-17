import { GoogleGenAI, Type } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export function getGoogleGenAiConfig(): { apiKey: string; model: string } {
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null;

  if (!apiKey) {
    throw new Error(
      'Missing GEMINI_API_KEY. Set the server-side environment variable before using the Google Gen AI provider.'
    );
  }

  return {
    apiKey,
    model: process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL,
  };
}

export function getGoogleGenAiClient(): GoogleGenAI {
  const { apiKey } = getGoogleGenAiConfig();
  return new GoogleGenAI({ apiKey });
}

export function extractTextFromResponse(response: unknown): string {
  if (typeof response === 'string' && response.trim()) {
    return response.trim();
  }

  if (!response || typeof response !== 'object') {
    return '';
  }

  const record = response as Record<string, unknown>;

  if (typeof record.text === 'string' && record.text.trim()) {
    return record.text.trim();
  }

  if (Array.isArray(record.candidates) && record.candidates.length > 0) {
    const candidateText = extractTextFromResponse(record.candidates[0]);
    if (candidateText) return candidateText;
  }

  if (record.content && typeof record.content === 'object') {
    const contentText = extractTextFromResponse(record.content);
    if (contentText) return contentText;
  }

  if (Array.isArray(record.parts) && record.parts.length > 0) {
    const firstText = record.parts
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        const text = (part as { text?: string }).text;
        return typeof text === 'string' ? text : '';
      })
      .find((text) => text.trim().length > 0);

    if (firstText) return firstText.trim();
  }

  return '';
}

export const CLASSIFICATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
    },
    confidence: {
      type: Type.NUMBER,
    },
    evidence: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ['type', 'confidence', 'evidence'],
};
