import { z } from 'zod';

/**
 * INCIDENT TAXONOMY
 * All incident types as TypeScript enum (type-safe, extensible)
 */
export enum IncidentType {
  PHISHING = 'PHISHING',
  MALWARE = 'MALWARE',
  RANSOMWARE = 'RANSOMWARE',
  ACCOUNT_TAKEOVER = 'ACCOUNT_TAKEOVER',
  DATA_BREACH = 'DATA_BREACH',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SOCIAL_ENGINEERING = 'SOCIAL_ENGINEERING',
  SUSPICIOUS_LINK = 'SUSPICIOUS_LINK',
  INSIDER_THREAT = 'INSIDER_THREAT',
  FRAUD = 'FRAUD',
  DENIAL_OF_SERVICE = 'DENIAL_OF_SERVICE',
  OTHER = 'OTHER',
}

/**
 * SEVERITY LEVELS
 * Four-level severity classification with numeric scoring
 */
export enum IncidentSeverity {
  LOW = 'LOW',           // 0–24
  MEDIUM = 'MEDIUM',     // 25–49
  HIGH = 'HIGH',         // 50–74
  CRITICAL = 'CRITICAL', // 75–100
}

/**
 * TECHNICAL INDICATOR TYPES
 * IOCs extracted from incident reports
 */
export enum IndicatorType {
  DOMAIN = 'DOMAIN',
  URL = 'URL',
  IPV4 = 'IPV4',
  IPV6 = 'IPV6',
  EMAIL = 'EMAIL',
  HASH = 'HASH',
  PHONE = 'PHONE',
  USERNAME = 'USERNAME',
  HOSTNAME = 'HOSTNAME',
  FILENAME = 'FILENAME',
  FILE_EXTENSION = 'FILE_EXTENSION',
}

/**
 * PII CATEGORIES
 * Personal information to be detected and redacted
 */
export enum PiiType {
  PERSON_NAME = 'PERSON_NAME',
  PHONE_NUMBER = 'PHONE_NUMBER',
  EMAIL_ADDRESS = 'EMAIL_ADDRESS',
  STUDENT_ID = 'STUDENT_ID',
  STAFF_ID = 'STAFF_ID',
  ACCOUNT_NUMBER = 'ACCOUNT_NUMBER',
  ADDRESS = 'ADDRESS',
  CREDIT_CARD = 'CREDIT_CARD',
  SSN = 'SSN',
}

/**
 * ROUTING DESTINATIONS
 * Where each incident should be sent
 */
export enum RoutingDestination {
  SOC = 'SOC',
  INCIDENT_RESPONSE = 'INCIDENT_RESPONSE',
  IDENTITY_SECURITY = 'IDENTITY_SECURITY',
  EMAIL_SECURITY = 'EMAIL_SECURITY',
  NETWORK_SECURITY = 'NETWORK_SECURITY',
  FRAUD_TEAM = 'FRAUD_TEAM',
  IT_SUPPORT = 'IT_SUPPORT',
  MANAGEMENT = 'MANAGEMENT',
  LEGAL_PRIVACY = 'LEGAL_PRIVACY',
  OTHER = 'OTHER',
}

/**
 * INCIDENT STATUS
 * Workflow states for incidents
 */
export enum IncidentStatus {
  NEW = 'NEW',
  TRIAGED = 'TRIAGED',
  INVESTIGATING = 'INVESTIGATING',
  ESCALATED = 'ESCALATED',
  RESOLVED = 'RESOLVED',
  FALSE_POSITIVE = 'FALSE_POSITIVE',
}

/**
 * ZOD SCHEMAS FOR VALIDATION
 */

// Technical Indicator
export const TechnicalIndicatorSchema = z.object({
  type: z.nativeEnum(IndicatorType),
  value: z.string().min(1).max(500),
  context: z.string().min(1).max(1000).optional(),
  confidence: z.number().min(0).max(1).optional(),
  isMalicious: z.boolean().optional(),
});

export type TechnicalIndicator = z.infer<typeof TechnicalIndicatorSchema>;

// PII Detection
export const PiiDetectionSchema = z.object({
  type: z.nativeEnum(PiiType),
  context: z.string().min(1).max(500).optional(),
  confidence: z.number().min(0).max(1),
  redactedAs: z.string().min(1).max(100),
});

export type PiiDetection = z.infer<typeof PiiDetectionSchema>;

// Related Incident
export const RelatedIncidentSchema = z.object({
  incidentId: z.string().min(1),
  similarity: z.number().min(0).max(1),
  reason: z.string().min(1).max(500),
});

export type RelatedIncident = z.infer<typeof RelatedIncidentSchema>;

// Routing Recommendation
export const RoutingRecommendationSchema = z.object({
  destination: z.nativeEnum(RoutingDestination),
  confidence: z.number().min(0).max(1),
  reasoning: z.array(z.string().min(1).max(500)),
});

export type RoutingRecommendation = z.infer<typeof RoutingRecommendationSchema>;

// Status History Entry
export const StatusHistorySchema = z.object({
  status: z.nativeEnum(IncidentStatus),
  timestamp: z.date(),
  analyst: z.string().optional(),
});

export type StatusHistory = z.infer<typeof StatusHistorySchema>;

// Core: Incident Analysis
export const IncidentAnalysisSchema = z.object({
  // Identifiers
  incidentId: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),

  // Raw input
  originalReport: z.string().min(1).max(10000),

  // Classification
  incidentType: z.nativeEnum(IncidentType),
  typeConfidence: z.number().min(0).max(1),

  // Severity
  severity: z.nativeEnum(IncidentSeverity),
  severityScore: z.number().min(0).max(100),
  severityReasons: z.array(z.string().min(1).max(500)),

  // Summary
  summary: z.string().min(10).max(1000),

  // Technical indicators
  technicalIndicators: z.array(TechnicalIndicatorSchema),

  // PII
  piiDetections: z.array(PiiDetectionSchema),
  sanitizedReport: z.string().min(1).max(10000),

  // Correlation
  relatedIncidents: z.array(RelatedIncidentSchema),
  clusterId: z.string().optional(),

  // Routing
  recommendedRoute: z.nativeEnum(RoutingDestination),
  routingReasoning: z.array(z.string().min(1).max(500)),

  // Recommended action
  recommendedAction: z.string().min(10).max(1000),

  // Status
  status: z.nativeEnum(IncidentStatus),
  statusHistory: z.array(StatusHistorySchema),

  // Analyst notes
  notes: z.string().max(2000).optional(),
});

export type IncidentAnalysis = z.infer<typeof IncidentAnalysisSchema>;

// Incident Submission Request
export const IncidentSubmissionSchema = z.object({
  report: z.string().min(1).max(10000),
});

export type IncidentSubmission = z.infer<typeof IncidentSubmissionSchema>;

// Incident Submission Response
export const IncidentSubmissionResponseSchema = z.object({
  incident: IncidentAnalysisSchema,
});

export type IncidentSubmissionResponse = z.infer<typeof IncidentSubmissionResponseSchema>;

// Error Response
export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Cluster
export const ClusterSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  incidentIds: z.array(z.string().min(1)),
  incidentCount: z.number().min(1),
  incidentType: z.nativeEnum(IncidentType),
  highestSeverity: z.nativeEnum(IncidentSeverity),
  commonIndicators: z.array(TechnicalIndicatorSchema),
  severityDistribution: z.object({
    CRITICAL: z.number().min(0),
    HIGH: z.number().min(0),
    MEDIUM: z.number().min(0),
    LOW: z.number().min(0),
  }),
  affectedOrganizations: z.array(z.string()).optional(),
  timelineStart: z.date(),
  timelineEnd: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Cluster = z.infer<typeof ClusterSchema>;

// Evaluation Result
export const EvaluationMetricsSchema = z.object({
  accuracy: z.number().min(0).max(1),
  precision: z.number().min(0).max(1),
  recall: z.number().min(0).max(1),
  f1: z.number().min(0).max(1),
});

export type EvaluationMetrics = z.infer<typeof EvaluationMetricsSchema>;

export const EvaluationResultSchema = z.object({
  runDate: z.date(),
  datasetSize: z.number().min(1),
  trainingSetSize: z.number().min(1),
  testSetSize: z.number().min(1),

  classification: z.object({
    accuracy: z.number().min(0).max(1),
    macroF1: z.number().min(0).max(1),
    perTypeMetrics: z.record(z.string(), EvaluationMetricsSchema),
    confusionMatrix: z.array(z.array(z.number())),
  }),

  severity: z.object({
    accuracy: z.number().min(0).max(1),
    macroF1: z.number().min(0).max(1),
    confusionMatrix: z.array(z.array(z.number())),
  }),

  iocExtraction: z.object({
    precision: z.number().min(0).max(1),
    recall: z.number().min(0).max(1),
    f1: z.number().min(0).max(1),
    perTypeMetrics: z.record(z.string(), EvaluationMetricsSchema),
  }),

  piiDetection: z.object({
    precision: z.number().min(0).max(1),
    recall: z.number().min(0).max(1),
    falsePositives: z.number().min(0),
    falseNegatives: z.number().min(0),
  }),

  duplicateDetection: z.object({
    precision: z.number().min(0).max(1),
    recall: z.number().min(0).max(1),
    falseMergeRate: z.number().min(0).max(1),
    missedDuplicateRate: z.number().min(0).max(1),
  }),

  performance: z.object({
    meanLatency: z.number().min(0),
    p95Latency: z.number().min(0),
    throughput: z.number().min(0),
    availability: z.number().min(0).max(1),
  }),

  knownFailures: z.array(
    z.object({
      incidentId: z.string(),
      reason: z.string(),
      expectedType: z.nativeEnum(IncidentType),
      actualType: z.nativeEnum(IncidentType),
    })
  ),
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
