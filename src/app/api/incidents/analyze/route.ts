import { NextRequest, NextResponse } from 'next/server';
import { IncidentSubmissionSchema, IncidentAnalysisSchema } from '@/types/incident';
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/errors';

/**
 * POST /api/incidents/analyze
 * 
 * Submit a raw incident report for AI-assisted analysis.
 * 
 * Request:
 * {
 *   "report": "raw incident report text"
 * }
 * 
 * Response (200):
 * {
 *   "incident": {
 *     "incidentId": "INC-0001",
 *     "incidentType": "PHISHING",
 *     "typeConfidence": 0.94,
 *     "severity": "HIGH",
 *     "severityScore": 68,
 *     ...
 *   }
 * }
 * 
 * Response (400):
 * {
 *   "error": "Report cannot be empty"
 * }
 * 
 * Response (500):
 * {
 *   "error": "Analysis service unavailable. Please try again."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        400,
        'Request body must be valid JSON'
      );
    }

    // Validate request with Zod schema
    const validationResult = IncidentSubmissionSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'Validation failed', { errors });
    }

    const { report } = validationResult.data;

    // TODO: PHASE 2 — Implement core analysis pipeline
    // 1. Call classification service
    // 2. Call severity calculator
    // 3. Call IOC extractor
    // 4. Call PII detector
    // 5. Call summarizer
    // 6. Call router
    // 7. Call action recommender
    // For now, return mock response to verify structure

    const mockAnalysis = {
      incidentId: `INC-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      originalReport: report,
      incidentType: 'OTHER',
      typeConfidence: 0.5,
      severity: 'MEDIUM',
      severityScore: 40,
      severityReasons: ['Unable to classify report'],
      summary: 'Report awaiting analysis.',
      technicalIndicators: [],
      piiDetections: [],
      sanitizedReport: report,
      relatedIncidents: [],
      clusterId: undefined,
      recommendedRoute: 'SOC',
      routingReasoning: ['Low confidence; forwarding to SOC for manual review'],
      recommendedAction: 'Manual review and classification required.',
      status: 'NEW',
      statusHistory: [
        {
          status: 'NEW',
          timestamp: new Date(),
        },
      ],
      notes: undefined,
    };

    // Validate response structure
    const responseValidation = IncidentAnalysisSchema.safeParse(mockAnalysis);
    if (!responseValidation.success) {
      logError('Analysis response validation failed', 'POST /api/incidents/analyze');
      throw new AppError(
        ErrorCode.ANALYSIS_FAILED,
        500,
        'Failed to generate valid analysis response',
        { errors: responseValidation.error.issues }
      );
    }

    return NextResponse.json(
      { incident: responseValidation.data },
      { status: 200 }
    );
  } catch (error) {
    logError(error, 'POST /api/incidents/analyze');
    const { statusCode, body } = createErrorResponse(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
