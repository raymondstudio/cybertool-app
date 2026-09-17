import { z } from 'zod';

export const IncidentReportInputSchema = z.object({
  report: z
    .string({ required_error: 'A report is required' })
    .trim()
    .min(10, 'Report must include at least 10 characters')
    .max(10000, 'Report must be under 10,000 characters'),
  source: z.string().trim().max(120).optional(),
  affectedSystem: z.string().trim().max(200).optional(),
});

export type IncidentReportInput = z.infer<typeof IncidentReportInputSchema>;

export function validateIncidentReport(input: unknown): IncidentReportInput {
  const result = IncidentReportInputSchema.safeParse(input);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join('; ');
    throw new Error(message || 'Invalid incident report');
  }

  return result.data;
}
