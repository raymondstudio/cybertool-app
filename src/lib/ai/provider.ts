/**
 * AI Provider Abstraction
 *
 * Provides a clean interface over the Gemini API with:
 *   - Fallback behavior when unavailable
 *   - Structured output validation
 *   - Rate limit and timeout handling
 *   - Schema-validated responses
 */

import { IncidentType } from '@/types/incident';
import type { ClassificationResult } from '../analysis/types';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface AiSummaryResult {
  summary: string;
  usedFallback: boolean;
}

export interface AiClassificationResult {
  classification: ClassificationResult | null;
  usedFallback: boolean;
}

// ─── Gemini client ────────────────────────────────────────────────────────────

function getApiKey(): string | null {
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? null;
}

async function callGemini(prompt: string, maxTokens = 512): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 8000)
      ),
    ]);

    // TypeScript needs the cast since Promise.race doesn't narrow well here
    const res = result as Awaited<ReturnType<typeof model.generateContent>>;
    return res.response.text();
  } catch (err) {
    // Log without exposing API key or report content
    console.error('[AI] Gemini call failed:', err instanceof Error ? err.message : 'Unknown error');
    return null;
  }
}

// ─── Summary generation ───────────────────────────────────────────────────────

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
  // Extract first 2 sentences from the report as a rough summary
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

  // Basic validation — summary should not be empty or too long
  const trimmed = aiText.trim();
  if (trimmed.length > 1000) {
    return {
      summary: trimmed.substring(0, 1000),
      usedFallback: false,
    };
  }

  return { summary: trimmed, usedFallback: false };
}

// ─── AI-enhanced classification ───────────────────────────────────────────────

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

function parseAiClassification(raw: string): ClassificationResult | null {
  try {
    // Extract JSON from response (AI sometimes adds extra text)
    const jsonMatch = raw.match(/\{[^{}]+\}/s);
    if (!jsonMatch) return null;

    const parsed: RawAiClassification = JSON.parse(jsonMatch[0]);

    // Validate type
    const validTypes = Object.values(IncidentType) as string[];
    if (
      !parsed.type ||
      typeof parsed.type !== 'string' ||
      !validTypes.includes(parsed.type)
    ) {
      return null;
    }

    // Validate confidence
    const confidence =
      typeof parsed.confidence === 'number'
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0.5;

    // Validate evidence
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
  const rawResponse = await callGemini(CLASSIFY_PROMPT(report), 256);

  if (!rawResponse) {
    return { classification: null, usedFallback: true };
  }

  const classification = parseAiClassification(rawResponse);
  return {
    classification,
    usedFallback: classification === null,
  };
}
