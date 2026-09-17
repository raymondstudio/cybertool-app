import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AppError, ErrorCode, createErrorResponse, logError } from '@/lib/errors';
import { analyzeIncident } from '@/lib/analysis/pipeline';
import { analyzeImageEvidence } from '@/lib/ai/provider';
import { IncidentInputSource, IncidentSource } from '@/types/incident';

const MAX_REPORT_LENGTH = 10_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGES = 3;
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const IMAGE_EXTENSIONS = /\.(png|jpe?g|webp)$/i;

const MetadataSchema = z.object({
  source: z.nativeEnum(IncidentSource).optional(),
  affectedSystem: z.string().max(200).optional(),
  reporterCategory: z.string().max(120).optional(),
  incidentTime: z.string().max(80).optional(),
  department: z.string().max(120).optional(),
});

function hasValidSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === 'image/png') {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    return bytes.length >= signature.length && signature.every((value, index) => bytes[index] === value);
  }
  if (mimeType === 'image/jpeg') {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === 'image/webp') {
    return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  return false;
}

function getTextField(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number.parseInt(contentLength, 10) > 20 * 1024 * 1024) {
      throw new AppError(ErrorCode.INVALID_INPUT, 413, 'The submission is too large.');
    }

    const form = await request.formData();
    const report = getTextField(form, 'report') ?? '';
    const metadataResult = MetadataSchema.safeParse({
      source: getTextField(form, 'source'),
      affectedSystem: getTextField(form, 'affectedSystem'),
      reporterCategory: getTextField(form, 'reporterCategory'),
      incidentTime: getTextField(form, 'incidentTime'),
      department: getTextField(form, 'department'),
    });

    if (!metadataResult.success) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'One or more incident details are invalid.');
    }
    if (report.length > MAX_REPORT_LENGTH) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'The incident report must be 10,000 characters or fewer.');
    }

    const images = form.getAll('evidence').filter((value): value is File => value instanceof File && value.size > 0);
    if (images.length > MAX_IMAGES) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'Upload no more than three screenshots.');
    }

    const imageResults: { name: string; type: string; size: number; extractedText: string; evidence: string[] }[] = [];
    for (const image of images) {
      if (!IMAGE_TYPES.has(image.type) || !IMAGE_EXTENSIONS.test(image.name)) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'Screenshots must be PNG, JPG, JPEG, or WEBP files.');
      }
      if (image.size > MAX_IMAGE_BYTES) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'Each screenshot must be 5 MB or smaller.');
      }

      const bytes = new Uint8Array(await image.arrayBuffer());
      if (!hasValidSignature(bytes, image.type)) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'One of the uploaded screenshots is not a valid image file.');
      }

      const result = await analyzeImageEvidence({
        data: Buffer.from(bytes).toString('base64'),
        mimeType: image.type,
      });
      imageResults.push({ name: image.name, type: image.type, size: image.size, ...result });
    }

    const imageText = imageResults.map((image) => [
      `[Screenshot evidence: ${image.name}]`,
      image.extractedText ? `Visible text:\n${image.extractedText}` : '',
      image.evidence.length ? `Visible security evidence:\n${image.evidence.map((item) => `- ${item}`).join('\n')}` : '',
    ].filter(Boolean).join('\n')).join('\n\n');

    const combinedReport = [
      report ? `[Analyst report]\n${report}` : '',
      imageText,
    ].filter(Boolean).join('\n\n');

    if (combinedReport.trim().length < 10) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 400, 'Add an incident report or upload a screenshot before analyzing.');
    }

    const inputSource = imageResults.length
      ? report ? IncidentInputSource.TEXT_AND_IMAGE : IncidentInputSource.IMAGE
      : IncidentInputSource.TEXT;

    const result = await analyzeIncident(combinedReport, {
      persist: false,
      inputSource,
      ...metadataResult.data,
      source: metadataResult.data.source ?? (imageResults.length ? IncidentSource.SCREENSHOT : undefined),
      evidence: imageResults.map(({ name, type, size }) => ({ name, type, size })),
    });

    return NextResponse.json({
      incident: result.analysis,
      priorityScore: result.priorityScore,
      imageAnalysis: imageResults.map(({ name, extractedText, evidence }) => ({ name, extractedText, evidence })),
    });
  } catch (error) {
    logError(error instanceof AppError ? error.toJSON() : error, 'POST /api/incidents/analyze');
    const { statusCode, body } = createErrorResponse(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
