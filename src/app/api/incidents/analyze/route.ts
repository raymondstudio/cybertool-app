import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/errors';
import { analyzeIncident } from '@/lib/analysis/pipeline';

// ─── Request validation ───────────────────────────────────────────────────────

const AnalyzeRequestSchema = z.object({
  report: z
    .string()
    .min(10, 'Report must be at least 10 characters')
    .max(10000, 'Report must not exceed 10,000 characters')
    .refine(
      (s) => s.trim().length >= 10,
      'Report cannot be whitespace only'
    ),
});

// ─── Handler ──────────────────────────────────────────────────────────────────

/**
 * POST /api/incidents/analyze
 *
 * Submit a raw incident report for full analysis.
 *
 * Request body: { "report": "raw text" }
 * Response 200: { "incident": IncidentAnalysis }
 * Response 400: { "error": "...", "code": "..." }
 * Response 500: { "error": "...", "code": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    // Size guard before JSON parsing (NextRequest doesn't expose body size directly)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100_000) {
      throw new AppError(ErrorCode.INVALID_INPUT, 413, 'Request body too large');
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        400,
        'Request body must be valid JSON'
      );
    }

    // Validate with Zod
    const parseResult = AnalyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      const messages = parseResult.error.issues.map((i) => i.message).join('; ');
      throw new AppError(ErrorCode.VALIDATION_ERROR, 400, messages);
    }

    const { report } = parseResult.data;

    // Run analysis pipeline
    const pipelineResult = await analyzeIncident(report);

    // Retrieve the persisted incident (pipeline already saved it)
    const incident = {
      incidentId: pipelineResult.context.incidentId,
      createdAt: pipelineResult.context.submittedAt,
      updatedAt: pipelineResult.context.submittedAt,
      originalReport: report,
      incidentType: pipelineResult.classification.type,
      typeConfidence: pipelineResult.classification.confidence,
      severity: pipelineResult.severity.severity,
      severityScore: pipelineResult.severity.score,
      severityReasons: pipelineResult.severity.reasons,
      summary: pipelineResult.summary,
      technicalIndicators: pipelineResult.indicators.map((ind) => ({
        type: ind.type,
        value: ind.value,
        context: ind.context,
        confidence: ind.confidence,
        isMalicious: ind.isMalicious,
      })),
      piiDetections: pipelineResult.sanitization.piiMatches
        .filter((p) => !p.isTechnicalIndicator)
        .map((p) => ({
          type: p.type,
          context: p.context,
          confidence: p.confidence,
          redactedAs: p.redactedAs,
        })),
      sanitizedReport: pipelineResult.sanitization.sanitizedReport,
      relatedIncidents: pipelineResult.relatedIncidents.map((r) => ({
        incidentId: r.incidentId,
        similarity: r.similarity,
        reason: r.reason,
      })),
      clusterId: pipelineResult.clusterAssignment.clusterId ?? undefined,
      recommendedRoute: pipelineResult.routing.destination,
      routingReasoning: pipelineResult.routing.reasoning,
      recommendedAction: pipelineResult.recommendedAction,
      status: 'NEW' as const,
      statusHistory: [
        {
          status: 'NEW' as const,
          timestamp: pipelineResult.context.submittedAt,
        },
      ],
      processingDurationMs: pipelineResult.processingDurationMs,
      usedFallback: pipelineResult.usedFallback,
    };

    return NextResponse.json({ incident }, { status: 200 });
  } catch (error) {
    // Never log the report content
    logError(
      error instanceof AppError ? error.toJSON() : error,
      'POST /api/incidents/analyze'
    );
    const { statusCode, body } = createErrorResponse(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
