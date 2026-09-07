/**
 * ERROR HANDLING UTILITIES
 * Consistent error handling and reporting across the application
 */

export enum ErrorCode {
  // Client Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',

  // AI Analysis Errors
  CLASSIFICATION_FAILED = 'CLASSIFICATION_FAILED',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',

  // Database Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  PERSIST_FAILED = 'PERSIST_FAILED',

  // Server Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  TIMEOUT = 'TIMEOUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public statusCode: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export function createErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: error.toJSON(),
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      body: {
        error: error.message,
        code: ErrorCode.INTERNAL_ERROR,
        statusCode: 500,
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      error: 'An unexpected error occurred',
      code: ErrorCode.INTERNAL_ERROR,
      statusCode: 500,
    },
  };
}

export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  if (context) {
    console.error(`[${timestamp}] ${context}:`, error);
  } else {
    console.error(`[${timestamp}] Error:`, error);
  }
}
