/**
 * Text normalization stage
 *
 * Cleans up messy report text without destroying evidence.
 * Always preserves the original report.
 */

import type { NormalizedReport } from './types';

/**
 * Normalize a raw incident report for downstream processing.
 * Preserves URLs, IPs, hashes, and technical indicators.
 * Does NOT aggressively stem or transform meaningful content.
 */
export function normalizeReport(rawReport: string): NormalizedReport {
  const original = rawReport;
  let text = rawReport;

  // 1. Normalize line endings to \n
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Remove null bytes and control characters (keep tabs and newlines)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 3. Normalize Unicode dashes to hyphens (preserves URLs)
  text = text.replace(/[\u2013\u2014\u2212]/g, '-');

  // 4. Normalize Unicode apostrophes/quotes to ASCII equivalents
  text = text.replace(/[\u2018\u2019]/g, "'");
  text = text.replace(/[\u201C\u201D]/g, '"');

  // 5. Collapse runs of 3+ blank lines to 2 blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  // 6. Trim leading/trailing whitespace per line, preserve indentation structure
  text = text
    .split('\n')
    .map((line) => line.trimEnd()) // trim trailing spaces per line
    .join('\n');

  // 7. Trim overall leading/trailing whitespace
  text = text.trim();

  return {
    original,
    normalized: text,
  };
}
