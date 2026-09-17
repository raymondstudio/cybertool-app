/**
 * Technical Indicator Extraction (IOC Extraction)
 *
 * Deterministic regex-based extraction of:
 *   URLs, Domains, IPv4, Email, Hashes (MD5/SHA1/SHA256), Phone, Filename
 *
 * Avoids:
 *   - Treating every number as an IP
 *   - Treating every word with a dot as a domain
 *   - Duplicate indicators
 *   - Corrupting URLs during extraction
 */

import { IndicatorType } from '@/types/incident';
import type { ExtractedIndicator } from './types';

// ─── Regex patterns ───────────────────────────────────────────────────────────

const PATTERNS = {
  // Full URLs — match http/https/ftp and www. prefixed domains
  URL: /(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>"'{}|\\^`[\]]{2,}/gi,

  // Standalone IPv4 (not part of URL) — must be valid octet ranges
  IPV4: /\b(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\b/g,

  // Email addresses
  EMAIL: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,

  // SHA-256 (64 hex chars)
  SHA256: /\b[a-fA-F0-9]{64}\b/g,

  // SHA-1 (40 hex chars)
  SHA1: /\b[a-fA-F0-9]{40}\b/g,

  // MD5 (32 hex chars)
  MD5: /\b[a-fA-F0-9]{32}\b/g,

  // Nigerian phone formats: 08XXXXXXXXX, +234XXXXXXXXXX, 234XXXXXXXXXX, 070/080/090/0701...
  PHONE_NG: /(?:\+?234|0)(?:7[01]|8[01]|9[0])\d{8}\b/g,

  // International phone: +X to +XX (X)XXXXXXXXXX — simplified but avoids catching IP segments
  PHONE_INTL: /\+\d{1,3}[\s\-.]?\(?\d{1,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{4}\b/g,

  // Suspicious filenames: things with double-extension or executable extensions
  FILENAME: /\b\w[\w\-. ]{0,50}\.(?:exe|dll|bat|cmd|vbs|ps1|sh|zip|rar|7z|iso|img|doc[xm]?|xls[xm]?|ppt[xm]?|pdf|js|ts|jar|war|apk|deb|rpm|msi|dmg|pkg)\b/gi,
};

// Known TLDs for domain validation (top 50+ by traffic)
const KNOWN_TLDS = new Set([
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'co',
  'io', 'dev', 'app', 'ai', 'uk', 'us', 'ca', 'au', 'de',
  'fr', 'ru', 'cn', 'jp', 'br', 'in', 'it', 'ng', 'za',
  'gh', 'ke', 'ug', 'tz', 'rw', 'et', 'biz', 'info', 'me',
  'tv', 'cc', 'ly', 'link', 'site', 'online', 'xyz', 'click',
  'top', 'tech', 'web', 'shop', 'store', 'cloud',
]);

// Common word-like TLD collisions that are NOT domains (filtered out)
const DOMAIN_FALSE_POSITIVES = new Set([
  'e.g', 'i.e', 'etc', 'vs', 'dr', 'mr', 'ms', 'ph', 'no', 'so',
]);

// Regex for standalone domain extraction (from text, not URLs)
const DOMAIN_RE = /\b(?:[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?\.)+([a-z]{2,})\b/gi;

// ─── Helper functions ─────────────────────────────────────────────────────────

function deduplicateByValue(indicators: ExtractedIndicator[]): ExtractedIndicator[] {
  const seen = new Map<string, ExtractedIndicator>();
  for (const ind of indicators) {
    const key = `${ind.type}:${ind.value.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.set(key, ind);
    }
  }
  return Array.from(seen.values());
}

function extractContext(text: string, matchStart: number, matchEnd: number, contextWindow = 60): string {
  const start = Math.max(0, matchStart - contextWindow);
  const end = Math.min(text.length, matchEnd + contextWindow);
  let context = text.slice(start, end).replace(/\n/g, ' ').trim();
  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';
  return context;
}

function isDomainSuspicious(domain: string): boolean {
  const lower = domain.toLowerCase();
  // Heuristics for suspicious domains
  const suspiciousKeywords = [
    'payroll', 'login', 'secure', 'verify', 'account', 'update',
    'banking', 'wallet', 'password', 'reset', 'confirm', 'auth',
    'signin', 'credentials', 'unlock', 'fraud', 'evil', 'fake',
    'phish', 'hack', 'steal', 'malware', 'ransom',
  ];
  return suspiciousKeywords.some((kw) => lower.includes(kw));
}

function isEmailSuspicious(email: string): boolean {
  const domain = email.split('@')[1] || '';
  return isDomainSuspicious(domain);
}

// ─── Extractors ───────────────────────────────────────────────────────────────

function extractUrls(text: string): ExtractedIndicator[] {
  const results: ExtractedIndicator[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PATTERNS.URL.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    let url = match[0].replace(/[.,;:!?'")]+$/, ''); // strip trailing punctuation
    results.push({
      type: IndicatorType.URL,
      value: url,
      context: extractContext(text, match.index, match.index + url.length),
      confidence: 0.95,
      isMalicious: isDomainSuspicious(url),
      source: 'deterministic',
    });

    // Also extract the domain from the URL
    try {
      const urlObj = new URL(url.startsWith('www.') ? 'https://' + url : url);
      const hostname = urlObj.hostname;
      if (hostname && hostname.includes('.')) {
        results.push({
          type: IndicatorType.DOMAIN,
          value: hostname,
          context: `Extracted from URL: ${url}`,
          confidence: 0.95,
          isMalicious: isDomainSuspicious(hostname),
          source: 'deterministic',
        });
      }
    } catch {
      // URL parsing failed — skip domain extraction for this URL
    }
  }

  return results;
}

function extractIpv4(text: string, urlMatches: string[]): ExtractedIndicator[] {
  const results: ExtractedIndicator[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PATTERNS.IPV4.source, 'g');

  // Build set of URL ranges to exclude IPs already captured as part of URLs
  const urlSet = new Set(urlMatches.map((u) => u.toLowerCase()));

  while ((match = re.exec(text)) !== null) {
    const ip = match[0];
    // Skip if this IP is already contained within a captured URL
    if (urlMatches.some((u) => u.includes(ip))) continue;
    // Skip private IP ranges — they're still indicators but less actionable
    const isPrivate =
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('127.') ||
      /^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip);

    results.push({
      type: IndicatorType.IPV4,
      value: ip,
      context: extractContext(text, match.index, match.index + ip.length),
      confidence: 0.98,
      isMalicious: !isPrivate, // external IPs in incident reports are suspicious
      source: 'deterministic',
    });
  }

  return results;
}

function extractEmails(text: string): ExtractedIndicator[] {
  const results: ExtractedIndicator[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PATTERNS.EMAIL.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    const email = match[0].toLowerCase();
    results.push({
      type: IndicatorType.EMAIL,
      value: email,
      context: extractContext(text, match.index, match.index + email.length),
      confidence: 0.92,
      isMalicious: isEmailSuspicious(email),
      source: 'deterministic',
    });
  }

  return results;
}

function extractHashes(text: string): ExtractedIndicator[] {
  const results: ExtractedIndicator[] = [];

  // SHA-256 first (most specific, 64 chars)
  const sha256Re = new RegExp(PATTERNS.SHA256.source, 'g');
  let match: RegExpExecArray | null;
  const sha256Positions = new Set<number>();

  while ((match = sha256Re.exec(text)) !== null) {
    sha256Positions.add(match.index);
    results.push({
      type: IndicatorType.HASH,
      value: match[0].toLowerCase(),
      context: extractContext(text, match.index, match.index + 64),
      confidence: 0.9,
      isMalicious: true,
      source: 'deterministic',
    });
  }

  // SHA-1 (40 chars) — skip positions already matched as SHA-256 prefix
  const sha1Re = new RegExp(PATTERNS.SHA1.source, 'g');
  while ((match = sha1Re.exec(text)) !== null) {
    if (!sha256Positions.has(match.index)) {
      results.push({
        type: IndicatorType.HASH,
        value: match[0].toLowerCase(),
        context: extractContext(text, match.index, match.index + 40),
        confidence: 0.85,
        isMalicious: true,
        source: 'deterministic',
      });
    }
  }

  // MD5 (32 chars) — require surrounding non-hex character to reduce false positives
  const md5Re = /(?<![a-fA-F0-9])[a-fA-F0-9]{32}(?![a-fA-F0-9])/g;
  while ((match = md5Re.exec(text)) !== null) {
    // Skip if already matched as SHA-1 start or SHA-256 start
    if (sha256Positions.has(match.index)) continue;
    results.push({
      type: IndicatorType.HASH,
      value: match[0].toLowerCase(),
      context: extractContext(text, match.index, match.index + 32),
      confidence: 0.75, // lower confidence — many hex strings are 32 chars
      isMalicious: true,
      source: 'deterministic',
    });
  }

  return results;
}

function extractPhones(text: string): ExtractedIndicator[] {
  const results: ExtractedIndicator[] = [];
  let match: RegExpExecArray | null;

  const reNg = new RegExp(PATTERNS.PHONE_NG.source, 'g');
  while ((match = reNg.exec(text)) !== null) {
    results.push({
      type: IndicatorType.PHONE,
      value: match[0],
      context: extractContext(text, match.index, match.index + match[0].length),
      confidence: 0.90,
      isMalicious: false,
      source: 'deterministic',
    });
  }

  return results;
}

function extractFilenames(text: string): ExtractedIndicator[] {
  const results: ExtractedIndicator[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PATTERNS.FILENAME.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    results.push({
      type: IndicatorType.FILENAME,
      value: match[0],
      context: extractContext(text, match.index, match.index + match[0].length),
      confidence: 0.85,
      isMalicious: true, // executable files in incident reports are suspicious
      source: 'deterministic',
    });
  }

  return results;
}

function extractStandaloneDomains(text: string, alreadyFoundUrls: string[]): ExtractedIndicator[] {
  const results: ExtractedIndicator[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(DOMAIN_RE.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    const domain = match[0].toLowerCase();
    const tld = match[1]?.toLowerCase();

    // Skip if already captured as part of a URL
    if (alreadyFoundUrls.some((u) => u.toLowerCase().includes(domain))) continue;

    // Require valid TLD
    if (!tld || !KNOWN_TLDS.has(tld)) continue;

    // Skip common false positives
    if (DOMAIN_FALSE_POSITIVES.has(domain)) continue;

    // Skip very short domains (likely abbreviations)
    if (domain.length < 5) continue;

    // Skip domains that look like version numbers (e.g. "1.0.0")
    if (/^\d[\d.]+$/.test(domain)) continue;

    results.push({
      type: IndicatorType.DOMAIN,
      value: domain,
      context: extractContext(text, match.index, match.index + domain.length),
      confidence: 0.80,
      isMalicious: isDomainSuspicious(domain),
      source: 'deterministic',
    });
  }

  return results;
}

// ─── Main extraction function ─────────────────────────────────────────────────

/**
 * Extract all technical indicators from a normalized report text.
 * Returns deduplicated indicators sorted by type and confidence.
 */
export function extractIndicators(text: string): ExtractedIndicator[] {
  const urlIndicators = extractUrls(text);
  const urlValues = urlIndicators
    .filter((i) => i.type === IndicatorType.URL)
    .map((i) => i.value);

  const allIndicators: ExtractedIndicator[] = [
    ...urlIndicators,
    ...extractIpv4(text, urlValues),
    ...extractEmails(text),
    ...extractHashes(text),
    ...extractPhones(text),
    ...extractFilenames(text),
    ...extractStandaloneDomains(text, urlValues),
  ];

  return deduplicateByValue(allIndicators);
}
