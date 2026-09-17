/**
 * AI Provider Abstraction
 *
 * Provides a clean interface over the Gemini API with:
 *   - Fallback behavior when unavailable
 *   - Structured output validation
 *   - Rate limit and timeout handling
 *   - Schema-validated responses
 */

import { GoogleGenAI, Type } from '@google/genai';
import { IncidentType } from '@/types/incident';
import type { ClassificationResult } from '../analysis/types';

const DEFAULT_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

export interface AiSummaryResult {
  summary: string;
  usedFallback: boolean;
}

export interface AiClassificationResult {
  classification: ClassificationResult | null;
  usedFallback: boolean;
}

export interface ImageAnalysisResult {
  extractedText: string;
  evidence: string[];
}

function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null;
}

function getClient(): GoogleGenAI | null {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

async function callGemini(
  prompt: string,
  maxTokens = 512,
  responseSchema?: typeof CLASSIFICATION_RESPONSE_SCHEMA
): Promise<string | null> {
  const genAI = getClient();
  if (!genAI) return null;

  try {
    const result = await Promise.race([
      genAI.models.generateContent({
        model: DEFAULT_MODEL,
        contents: prompt,
        config: {
          maxOutputTokens: maxTokens,
          ...(responseSchema ? { responseMimeType: 'application/json', responseSchema } : {}),
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 8000)
      ),
    ]);

    if (!result || typeof result !== 'object') return null;

    const record = result as unknown as Record<string, unknown>;
    if (typeof record.text === 'string' && record.text.trim()) {
      return record.text.trim();
    }

    const content = record.content;
    if (content && typeof content === 'object') {
      const nested = content as Record<string, unknown>;
      if (Array.isArray(nested.parts)) {
        const text = nested.parts
          .map((part) => {
            if (!part || typeof part !== 'object') return '';
            const value = (part as { text?: string }).text;
            return typeof value === 'string' ? value : '';
          })
          .join('')
          .trim();

        if (text) return text;
      }
    }

    if (Array.isArray(record.candidates)) {
      const candidate = record.candidates[0] as Record<string, unknown>;
      const candidateText = typeof candidate.text === 'string' ? candidate.text : '';
      if (candidateText.trim()) return candidateText.trim();
    }

    return null;
  } catch (err) {
    console.error('[AI] Gemini call failed:', err instanceof Error ? err.message : 'Unknown error');
    return null;
  }
}

export async function analyzeImageEvidence(
  image: { data: string; mimeType: string }
): Promise<ImageAnalysisResult> {
  const genAI = getClient();
  if (!genAI) {
    throw new Error('Image analysis requires GEMINI_API_KEY.');
  }

  const result = await Promise.race([
    genAI.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [
        {
          text: 'Extract only information visible in this cybersecurity incident screenshot. Return JSON with extractedText as a faithful transcription of relevant visible text and evidence as concise security-relevant observations. Do not invent or infer details that are not visible.',
        },
        { inlineData: image },
      ],
      config: {
        maxOutputTokens: 1200,
        responseMimeType: 'application/json',
      },
    }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Image analysis timed out')), 12000)
    ),
  ]);

  const text = typeof result.text === 'string' ? result.text.trim() : '';
  if (!text) throw new Error('The screenshot did not produce readable analysis.');

  try {
    const parsed = JSON.parse(text) as { extractedText?: unknown; evidence?: unknown };
    return {
      extractedText: typeof parsed.extractedText === 'string' ? parsed.extractedText.trim() : '',
      evidence: Array.isArray(parsed.evidence)
        ? parsed.evidence.filter((item): item is string => typeof item === 'string').slice(0, 8)
        : [],
    };
  } catch {
    throw new Error('The screenshot analysis returned an invalid result.');
  }
}

const SUMMARY_PROMPT = (report: string, incidentType: string) => `
You are a cybersecurity analyst. Given the raw incident report below, write a concise 2-3 sentence summary suitable for a security operations center.

Rules:
- State what happened, what was affected, and the likely risk level
- Use uncertainty language where appropriate ("appears to be", "potentially", "suspected")
- Do NOT invent facts not in the report
- Do NOT use generic phrases like "This requires investigation"
- Return ONLY the summary text, no headers or labels
- Maximum 200 words

Incident type: ${incidentType}

Report:
${report.substring(0, 2000)}

Summary:`.trim();

function buildFallbackSummary(report: string, incidentType: string): string {
  const sentences = report
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 20)
    .slice(0, 2);

  if (sentences.length >= 2) {
    return `${sentences.join(' ')} Incident classified as ${incidentType.replace(/_/g, ' ').toLowerCase()}.`;
  }

  return `Incident report received and classified as ${incidentType.replace(/_/g, ' ').toLowerCase()}. Manual review required to assess full scope and impact.`;
}

export async function generateSummary(
  report: string,
  incidentType: string
): Promise<AiSummaryResult> {
  const aiText = await callGemini(SUMMARY_PROMPT(report, incidentType), 300);

  if (!aiText || aiText.trim().length < 20) {
    return {
      summary: buildFallbackSummary(report, incidentType),
      usedFallback: true,
    };
  }

  const trimmed = aiText.trim();
  if (trimmed.length > 1000) {
    return {
      summary: trimmed.substring(0, 1000),
      usedFallback: false,
    };
  }

  return { summary: trimmed, usedFallback: false };
}

const INCIDENT_TYPES = Object.values(IncidentType).join(', ');

const CLASSIFY_PROMPT = (report: string) => `
You are a cybersecurity incident classifier. Classify the following incident report into exactly one of these types:
${INCIDENT_TYPES}

Return a JSON object with this exact structure:
{"type": "INCIDENT_TYPE", "confidence": 0.95, "evidence": ["reason 1", "reason 2", "reason 3"]}

Rules:
- confidence is a number 0.0–1.0
- evidence is an array of 2-4 strings explaining your classification
- Do NOT return any text outside the JSON object
- If you cannot determine the type, use OTHER with confidence 0.3

Report:
${report.substring(0, 2000)}`.trim();

interface RawAiClassification {
  type?: unknown;
  confidence?: unknown;
  evidence?: unknown;
}

const CLASSIFICATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    evidence: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['type', 'confidence', 'evidence'],
} as const;

function parseAiClassification(raw: string): ClassificationResult | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed: RawAiClassification = JSON.parse(jsonMatch[0]);

    const validTypes = Object.values(IncidentType) as string[];
    if (
      !parsed.type ||
      typeof parsed.type !== 'string' ||
      !validTypes.includes(parsed.type)
    ) {
      return null;
    }

    const confidence =
      typeof parsed.confidence === 'number'
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.5;

    const evidence =
      Array.isArray(parsed.evidence) && parsed.evidence.every((e) => typeof e === 'string')
        ? (parsed.evidence as string[]).slice(0, 5)
        : ['AI-assisted classification'];

    return {
      type: parsed.type as IncidentType,
      confidence,
      evidence,
      method: 'ai',
    };
  } catch {
    return null;
  }
}

export async function classifyWithAi(report: string): Promise<AiClassificationResult> {
  const rawResponse = await callGemini(CLASSIFY_PROMPT(report), 256, CLASSIFICATION_RESPONSE_SCHEMA);

  if (!rawResponse) {
    return { classification: null, usedFallback: true };
  }

  const classification = parseAiClassification(rawResponse);
  return {
    classification,
    usedFallback: classification === null,
  };
}
