/**
 * Analysis domain internal types
 * Used across all pipeline stages. Maps to public types in src/types/incident.ts
 */

import {
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  RoutingDestination,
  IndicatorType,
  PiiType,
} from '@/types/incident';

export type { IncidentType, IncidentSeverity, IncidentStatus, RoutingDestination, IndicatorType, PiiType };

// ─── Stage outputs ────────────────────────────────────────────────────────────

export interface NormalizedReport {
  original: string;
  normalized: string;
}

export interface ClassificationResult {
  type: IncidentType;
  confidence: number; // 0–1
  evidence: string[];
  method: 'deterministic' | 'ai' | 'hybrid';
}

export interface SeverityFactor {
  name: string;
  points: number;
  maxPoints: number;
  triggered: boolean;
  reason: string;
}

export interface SeverityResult {
  severity: IncidentSeverity;
  score: number; // 0–100
  factors: SeverityFactor[];
  reasons: string[];
}

export interface ExtractedIndicator {
  type: IndicatorType;
  value: string;
  context: string;
  confidence: number; // 0–1
  isMalicious: boolean;
  source: 'deterministic' | 'ai';
}

export interface PiiMatch {
  type: PiiType;
  value: string;           // original value — never displayed in UI
  redactedAs: string;      // [PERSON], [PHONE], etc.
  startIndex: number;
  endIndex: number;
  context: string;
  confidence: number;
  isTechnicalIndicator: boolean;
}

export interface SanitizationResult {
  sanitizedReport: string;
  piiMatches: PiiMatch[];
}

export interface RoutingResult {
  destination: RoutingDestination;
  confidence: number; // 0–1
  reasoning: string[];
  escalationRequired: boolean;
}

export interface SimilarityMatch {
  incidentId: string;
  similarity: number; // 0–1
  reason: string;
  isDuplicate: boolean;
}

export interface ClusterAssignment {
  clusterId: string | null;
  isNewCluster: boolean;
  clusterSize: number;
}

// ─── Full pipeline result ─────────────────────────────────────────────────────

export interface PipelineContext {
  incidentId: string;
  submittedAt: Date;
  analysisVersion: string;
}

export interface PipelineResult {
  context: PipelineContext;
  normalized: NormalizedReport;
  classification: ClassificationResult;
  severity: SeverityResult;
  indicators: ExtractedIndicator[];
  sanitization: SanitizationResult;
  summary: string;
  routing: RoutingResult;
  recommendedAction: string;
  relatedIncidents: SimilarityMatch[];
  clusterAssignment: ClusterAssignment;
  processingDurationMs: number;
  usedFallback: boolean;
}
