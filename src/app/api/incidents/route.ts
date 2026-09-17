import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { incidentStore } from '@/lib/data/store';
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/errors';
import { IncidentSeverity, IncidentType, IncidentStatus } from '@/types/incident';

// ─── Query parameter validation ───────────────────────────────────────────────

const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  type: z.nativeEnum(IncidentType).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  search: z.string().max(200).optional(),
});

/**
 * GET /api/incidents
 * Returns a paginated, filtered, priority-sorted list of incidents.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const params = ListQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      severity: searchParams.get('severity') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    });

    if (!params.success) {
      const messages = params.error.issues.map((i) => i.message).join('; ');
      throw new AppError(ErrorCode.VALIDATION_ERROR, 400, messages);
    }

    const result = incidentStore.list(params.data);

    return NextResponse.json({
      incidents: result.incidents,
      pagination: {
        page: params.data.page,
        limit: params.data.limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (error) {
    logError(error, 'GET /api/incidents');
    const { statusCode, body } = createErrorResponse(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
