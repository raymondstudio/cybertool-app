/**
 * Incident Classification Engine
 *
 * Layered strategy:
 *   1. Strong deterministic signals (high-confidence keywords + patterns)
 *   2. Keyword scoring across all categories
 *   3. Confidence calculation
 *   4. Fallback to OTHER when evidence is insufficient
 *
 * Does NOT call any external API. AI-enhanced classification is done
 * separately and merges with this result in the pipeline orchestrator.
 */

import { IncidentType } from '@/types/incident';
import type { ClassificationResult } from './types';

// ─── Signal definitions ───────────────────────────────────────────────────────

interface SignalGroup {
  type: IncidentType;
  strongSignals: string[]; // Any one of these alone gives high confidence
  supportingSignals: string[]; // Multiple needed to build confidence
  weight: number; // How many supporting signals equal one strong signal
}

const SIGNAL_GROUPS: SignalGroup[] = [
  {
    type: IncidentType.PHISHING,
    strongSignals: [
      'phishing', 'phish', 'fake login', 'fake website', 'spoofed',
      'credential harvesting', 'entered my password', 'entered password',
      'typed my password', 'submitted password', 'gave my password',
      'password was stolen', 'fake payroll', 'fake portal',
    ],
    supportingSignals: [
      'suspicious email', 'suspicious link', 'suspicious url',
      'suspicious website', 'suspicious domain', 'lookalike domain',
      'email asking for', 'email requesting', 'urgent password',
      'password reset', 'verify account', 'confirm details',
      'bank details', 'login page', 'login form', 'fake',
      'impersonat', 'pretending to be', 'disguised as',
      'redirected', 'credential', 'clicked link', 'clicked a link',
    ],
    weight: 2,
  },
  {
    type: IncidentType.MALWARE,
    strongSignals: [
      'malware', 'trojan', 'spyware', 'worm', 'rootkit', 'keylogger',
      'virus detected', 'antivirus detected', 'infected with',
      'malicious software', 'malicious executable', 'malicious file',
    ],
    supportingSignals: [
      'suspicious executable', 'unexpected software', 'unknown software',
      'strange program', 'weird program', 'program installed itself',
      'automatic download', 'auto-downloaded', 'downloaded without',
      '.exe file', 'dll file', 'suspicious process', 'unknown process',
      'system slowed', 'computer behaving', 'strange behavior',
      'pop-up', 'popup', 'unusual activity',
    ],
    weight: 3,
  },
  {
    type: IncidentType.RANSOMWARE,
    strongSignals: [
      'ransomware', 'files encrypted', 'files are encrypted',
      'ransom note', 'ransom demand', 'ransom message',
      'pay to decrypt', 'bitcoin payment', 'crypto payment',
      'decrypt files', 'decryption key', 'pay or files',
      'files locked', 'locked files', 'pay ransom',
      'cannot open files', "can't access files", 'files inaccessible',
    ],
    supportingSignals: [
      'extortion', 'payment demanded', 'deadline to pay',
      'files changed extension', 'unknown extension', '.locked',
      '.encrypted', 'readme.txt appeared', 'how_to_decrypt',
      'your files', 'all files', 'restore files', 'restore data',
    ],
    weight: 2,
  },
  {
    type: IncidentType.ACCOUNT_TAKEOVER,
    strongSignals: [
      'account taken over', 'account hacked', 'account compromised',
      'unauthorized login', 'login from unknown location',
      'password changed without', 'password was changed',
      'someone logged in', 'strange login', 'unusual login',
      'logged into my account', 'account accessed',
    ],
    supportingSignals: [
      'mfa bypass', '2fa bypass', 'authentication bypass',
      'session hijacked', 'session expired unexpectedly',
      'suspicious login', 'login alert', 'new device login',
      'unrecognized device', 'account locked', 'security alert',
    ],
    weight: 2,
  },
  {
    type: IncidentType.DATA_BREACH,
    strongSignals: [
      'data breach', 'data exposed', 'data leaked', 'data exfiltrated',
      'database dumped', 'database stolen', 'records stolen',
      'customer data stolen', 'student data stolen', 'staff data stolen',
      'sensitive data exposed', 'sensitive information leaked',
      'personal information leaked', 'personal data leaked',
    ],
    supportingSignals: [
      'data accessed', 'unauthorized access to data',
      'confidential information', 'data exfil', 'exfiltration',
      'data theft', 'records exposed', 'database accessed',
      'copied database', 'exported records', 'downloaded records',
    ],
    weight: 2,
  },
  {
    type: IncidentType.UNAUTHORIZED_ACCESS,
    strongSignals: [
      'unauthorized access', 'gained access without', 'broke into system',
      'bypassed access control', 'accessed without permission',
      'unauthorized entry', 'intruder detected', 'intrusion detected',
    ],
    supportingSignals: [
      'accessed server', 'accessed system', 'accessed database',
      'bypassed security', 'brute force', 'credential stuffing',
      'exploitation', 'exploited vulnerability', 'privilege escalation',
      'elevated privileges', 'privilege abuse',
    ],
    weight: 3,
  },
  {
    type: IncidentType.SOCIAL_ENGINEERING,
    strongSignals: [
      'social engineering', 'manipulated into', 'tricked into',
      'deceived into', 'convinced to reveal', 'pretexting',
      'vishing', 'smishing', 'baiting',
    ],
    supportingSignals: [
      'phone call asking', 'caller claiming', 'impersonating it',
      'impersonating support', 'fake support', 'tech support scam',
      'someone called', 'asked for password', 'asked for access',
      'shared credentials over phone', 'shared credentials verbally',
    ],
    weight: 2,
  },
  {
    type: IncidentType.SUSPICIOUS_LINK,
    strongSignals: [
      'suspicious link', 'suspicious url', 'strange link', 'weird link',
      'unknown link', 'unusual link',
    ],
    supportingSignals: [
      'received a link', 'got a link', 'link sent', 'link shared',
      'link in message', 'link via whatsapp', 'link via email',
      'clicked but not sure', 'not sure if safe', 'might be unsafe',
    ],
    weight: 2,
  },
  {
    type: IncidentType.INSIDER_THREAT,
    strongSignals: [
      'insider threat', 'employee stealing', 'employee leaked',
      'staff member copied', 'colleague stealing data', 'employee misuse',
      'authorized user stealing', 'internal actor',
    ],
    supportingSignals: [
      'employee accessing', 'colleague accessing', 'staff accessing',
      'internal misuse', 'data misuse', 'policy violation',
      'fired employee', 'disgruntled employee', 'access after termination',
    ],
    weight: 2,
  },
  {
    type: IncidentType.FRAUD,
    strongSignals: [
      'financial fraud', 'money stolen', 'money transferred',
      'unauthorized transaction', 'fraudulent transaction',
      'wire fraud', 'business email compromise', 'bec fraud',
      'invoice fraud', 'advance fee', '419 fraud', 'scam money',
    ],
    supportingSignals: [
      'money lost', 'payment made', 'transfer made', 'bank transfer',
      'fraudulent payment', 'suspicious payment', 'payment fraud',
      'financial loss', 'lost money', 'charged without',
      'credit card fraud', 'debit card fraud',
    ],
    weight: 2,
  },
  {
    type: IncidentType.DENIAL_OF_SERVICE,
    strongSignals: [
      'ddos', 'denial of service', 'dos attack', 'service unavailable',
      'website down', 'server flooded', 'traffic flood',
      'system overwhelmed',
    ],
    supportingSignals: [
      'website slow', 'server slow', 'network congestion',
      'high traffic', 'many requests', 'request flood',
      'bandwidth exhausted', 'system unresponsive',
    ],
    weight: 3,
  },
];

// ─── Scoring ──────────────────────────────────────────────────────────────────

interface TypeScore {
  type: IncidentType;
  score: number;
  strongHits: string[];
  supportingHits: string[];
}

function scoreText(text: string): TypeScore[] {
  const lower = text.toLowerCase();
  const scores: TypeScore[] = [];

  for (const group of SIGNAL_GROUPS) {
    const strongHits: string[] = [];
    const supportingHits: string[] = [];

    for (const signal of group.strongSignals) {
      if (lower.includes(signal)) {
        strongHits.push(signal);
      }
    }

    for (const signal of group.supportingSignals) {
      if (lower.includes(signal)) {
        supportingHits.push(signal);
      }
    }

    const score = strongHits.length * group.weight + supportingHits.length;
    if (score > 0) {
      scores.push({ type: group.type, score, strongHits, supportingHits });
    }
  }

  return scores.sort((a, b) => b.score - a.score);
}

function scoreToConfidence(score: number, hasStrongSignal: boolean): number {
  if (hasStrongSignal) {
    if (score >= 4) return 0.95;
    if (score >= 3) return 0.88;
    if (score >= 2) return 0.82;
    return 0.75;
  } else {
    if (score >= 6) return 0.72;
    if (score >= 4) return 0.65;
    if (score >= 3) return 0.58;
    if (score >= 2) return 0.50;
    return 0.40;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Classify an incident report using deterministic signal scoring.
 * Returns the best classification along with evidence and confidence.
 */
export function classifyIncident(text: string): ClassificationResult {
  const scores = scoreText(text);

  if (scores.length === 0) {
    return {
      type: IncidentType.OTHER,
      confidence: 0.30,
      evidence: ['No specific cybersecurity signals detected'],
      method: 'deterministic',
    };
  }

  const best = scores[0];
  const hasStrongSignal = best.strongHits.length > 0;
  const confidence = scoreToConfidence(best.score, hasStrongSignal);

  // Check for ambiguity — if second result is within 30% of best, lower confidence
  const isAmbiguous = scores.length > 1 && scores[1].score >= best.score * 0.7;
  const adjustedConfidence = isAmbiguous ? confidence * 0.85 : confidence;

  const evidence: string[] = [];

  for (const hit of best.strongHits.slice(0, 3)) {
    evidence.push(`Strong signal: "${hit}"`);
  }
  for (const hit of best.supportingHits.slice(0, 4)) {
    evidence.push(`Supporting signal: "${hit}"`);
  }

  if (isAmbiguous) {
    evidence.push(`Ambiguous: also resembles ${scores[1].type}`);
  }

  return {
    type: best.type,
    confidence: Math.round(adjustedConfidence * 100) / 100,
    evidence,
    method: 'deterministic',
  };
}

/**
 * Merge deterministic classification with AI classification.
 * AI result takes precedence if its confidence exceeds the deterministic result
 * by a meaningful margin (>0.10). Otherwise, the deterministic result is used.
 */
export function mergeClassifications(
  deterministic: ClassificationResult,
  ai: ClassificationResult | null
): ClassificationResult {
  if (!ai) return deterministic;

  // If both agree, boost confidence
  if (ai.type === deterministic.type) {
    return {
      type: deterministic.type,
      confidence: Math.min(0.99, (deterministic.confidence + ai.confidence) / 2 + 0.05),
      evidence: [...deterministic.evidence, ...ai.evidence.slice(0, 2)],
      method: 'hybrid',
    };
  }

  // AI disagrees — use AI only if significantly more confident
  if (ai.confidence > deterministic.confidence + 0.15) {
    return {
      ...ai,
      evidence: [...ai.evidence, `Overrode deterministic result (${deterministic.type} at ${deterministic.confidence})`],
      method: 'hybrid',
    };
  }

  // Deterministic wins
  return {
    ...deterministic,
    evidence: [...deterministic.evidence, `AI suggested ${ai.type} but with lower confidence (${ai.confidence})`],
    method: 'hybrid',
  };
}
