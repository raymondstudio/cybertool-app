/**
 * Similarity and Duplicate Detection
 *
 * Multi-factor similarity scoring:
 *   - Normalized text edit distance (Levenshtein-based)
 *   - Shared technical indicators (IOC overlap)
 *   - Incident type match
 *   - Simple token overlap (TF-IDF-like)
 *
 * Thresholds:
 *   >= 0.95 = Duplicate
 *   0.75–0.95 = Near-duplicate
 *   0.50–0.75 = Related
 *   < 0.50 = Unrelated
 */

import type { SimilarityMatch, ExtractedIndicator } from './types';
import { IncidentType } from '@/types/incident';

// ─── Text similarity ──────────────────────────────────────────────────────────

/**
 * Simple character-level normalized edit distance.
 * Suitable for short-to-medium texts (< 2000 chars).
 * For longer texts we sample tokens instead.
 */
function editDistanceSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;

  // For long texts, use token overlap instead of edit distance
  if (a.length > 500 || b.length > 500) {
    return tokenOverlapSimilarity(a, b);
  }

  const la = a.length;
  const lb = b.length;

  // Create DP table
  const dp: number[][] = Array.from({ length: la + 1 }, (_, i) =>
    Array.from({ length: lb + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const maxLen = Math.max(la, lb);
  return 1 - dp[la][lb] / maxLen;
}

/**
 * Token-based Jaccard similarity (fast for long texts).
 */
function tokenOverlapSimilarity(a: string, b: string): number {
  const tokenize = (s: string): Set<string> => {
    const words = s.toLowerCase().match(/\b\w{3,}\b/g) || [];
    return new Set(words);
  };

  const setA = tokenize(a);
  const setB = tokenize(b);

  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return intersection / union;
}

// ─── IOC overlap ──────────────────────────────────────────────────────────────

function iocOverlapScore(
  indicatorsA: ExtractedIndicator[],
  indicatorsB: ExtractedIndicator[]
): number {
  if (indicatorsA.length === 0 && indicatorsB.length === 0) return 0;
  if (indicatorsA.length === 0 || indicatorsB.length === 0) return 0;

  const valuesA = new Set(indicatorsA.map((i) => i.value.toLowerCase()));
  const valuesB = new Set(indicatorsB.map((i) => i.value.toLowerCase()));

  let shared = 0;
  for (const v of valuesA) {
    if (valuesB.has(v)) shared++;
  }

  const union = valuesA.size + valuesB.size - shared;
  return union === 0 ? 0 : shared / union;
}

// ─── Composite similarity ─────────────────────────────────────────────────────

/**
 * Compute composite similarity between two incidents.
 *
 * Weights (must sum to 1.0):
 *   - Text similarity: 0.50
 *   - IOC overlap: 0.30
 *   - Incident type match: 0.10
 *   - Length ratio: 0.10
 */
function computeSimilarity(
  textA: string,
  textB: string,
  indicatorsA: ExtractedIndicator[],
  indicatorsB: ExtractedIndicator[],
  typeA: IncidentType,
  typeB: IncidentType
): { score: number; components: Record<string, number> } {
  const textSim = textA === textB ? 1.0 : Math.max(
    tokenOverlapSimilarity(textA, textB),
    editDistanceSimilarity(textA, textB)
  );

  const iocSim = iocOverlapScore(indicatorsA, indicatorsB);
  const typeSim = typeA === typeB ? 1.0 : 0.0;

  const lenA = textA.length;
  const lenB = textB.length;
  const lenRatio = Math.min(lenA, lenB) / Math.max(lenA, lenB);

  const score =
    textSim * 0.50 +
    iocSim * 0.30 +
    typeSim * 0.10 +
    lenRatio * 0.10;

  return {
    score: Math.min(1.0, Math.round(score * 1000) / 1000),
    components: { textSim, iocSim, typeSim, lenRatio },
  };
}

// ─── Stored incident data structure ──────────────────────────────────────────

export interface StoredIncidentSummary {
  incidentId: string;
  normalizedText: string;
  indicators: ExtractedIndicator[];
  incidentType: IncidentType;
  createdAt: Date;
}

// ─── Similarity reason builder ────────────────────────────────────────────────

function buildSimilarityReason(
  components: Record<string, number>,
  score: number
): string {
  const parts: string[] = [];

  if (components.textSim > 0.80) parts.push('Very similar report text');
  else if (components.textSim > 0.60) parts.push('Similar report language');

  if (components.iocSim > 0.50) parts.push('Shared technical indicators');
  else if (components.iocSim > 0.20) parts.push('Some shared indicators');

  if (components.typeSim === 1.0) parts.push('Same incident type');

  if (parts.length === 0) {
    if (score >= 0.50) parts.push('General pattern similarity');
    else parts.push('Low similarity');
  }

  return parts.join('; ');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Find related incidents by comparing against a list of stored incidents.
 * Returns matches with similarity >= 0.50, sorted by similarity descending.
 */
export function findRelatedIncidents(
  current: {
    normalizedText: string;
    indicators: ExtractedIndicator[];
    incidentType: IncidentType;
  },
  storedIncidents: StoredIncidentSummary[]
): SimilarityMatch[] {
  const matches: SimilarityMatch[] = [];

  for (const stored of storedIncidents) {
    const { score, components } = computeSimilarity(
      current.normalizedText,
      stored.normalizedText,
      current.indicators,
      stored.indicators,
      current.incidentType,
      stored.incidentType
    );

    if (score >= 0.50) {
      matches.push({
        incidentId: stored.incidentId,
        similarity: score,
        reason: buildSimilarityReason(components, score),
        isDuplicate: score >= 0.95,
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}
