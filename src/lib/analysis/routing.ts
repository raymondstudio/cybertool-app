/**
 * Incident Routing Engine
 *
 * Deterministic routing based on incident type and severity.
 * Rules are defined in a lookup table matching PRD routing model.
 */

import { IncidentType, IncidentSeverity, RoutingDestination } from '@/types/incident';
import type { RoutingResult, ClassificationResult, SeverityResult } from './types';

// ─── Routing rule table ───────────────────────────────────────────────────────

interface RoutingRule {
  types: IncidentType[];
  severities: IncidentSeverity[] | 'ALL';
  destination: RoutingDestination;
  reasoning: string[];
  escalationRequired: boolean;
  confidence: number;
}

const ROUTING_RULES: RoutingRule[] = [
  // Ransomware: always escalate to incident response
  {
    types: [IncidentType.RANSOMWARE],
    severities: 'ALL',
    destination: RoutingDestination.INCIDENT_RESPONSE,
    reasoning: [
      'Ransomware requires immediate incident response activation',
      'Affected systems must be isolated before further action',
      'Evidence preservation and forensic analysis required',
    ],
    escalationRequired: true,
    confidence: 0.99,
  },

  // Data breach: incident response + legal/privacy
  {
    types: [IncidentType.DATA_BREACH],
    severities: 'ALL',
    destination: RoutingDestination.INCIDENT_RESPONSE,
    reasoning: [
      'Data breach requires investigation of scope and extent',
      'Regulatory notification obligations may apply',
      'Privacy and legal team should be engaged in parallel',
    ],
    escalationRequired: true,
    confidence: 0.97,
  },

  // Insider threat: always incident response
  {
    types: [IncidentType.INSIDER_THREAT],
    severities: 'ALL',
    destination: RoutingDestination.INCIDENT_RESPONSE,
    reasoning: [
      'Insider threat requires investigation by a team with appropriate access',
      'HR and legal involvement may be required',
      'Evidence must be collected before the subject is alerted',
    ],
    escalationRequired: true,
    confidence: 0.95,
  },

  // Phishing: high/critical → email security + SOC
  {
    types: [IncidentType.PHISHING],
    severities: [IncidentSeverity.HIGH, IncidentSeverity.CRITICAL],
    destination: RoutingDestination.EMAIL_SECURITY,
    reasoning: [
      'High-severity phishing requires immediate email infrastructure action',
      'Malicious domain should be blocked at email gateway',
      'SOC should investigate user account compromise',
    ],
    escalationRequired: false,
    confidence: 0.90,
  },

  // Phishing: low/medium → SOC
  {
    types: [IncidentType.PHISHING],
    severities: [IncidentSeverity.LOW, IncidentSeverity.MEDIUM],
    destination: RoutingDestination.SOC,
    reasoning: [
      'Standard phishing triage by SOC',
      'Verify whether credentials were actually submitted',
      'Block malicious domain if confirmed',
    ],
    escalationRequired: false,
    confidence: 0.88,
  },

  // Account takeover: high/critical → identity security
  {
    types: [IncidentType.ACCOUNT_TAKEOVER],
    severities: [IncidentSeverity.HIGH, IncidentSeverity.CRITICAL],
    destination: RoutingDestination.IDENTITY_SECURITY,
    reasoning: [
      'Account takeover requires immediate credential reset',
      'Session invalidation across all active sessions',
      'Review of authentication logs and MFA configuration',
    ],
    escalationRequired: false,
    confidence: 0.92,
  },

  // Account takeover: low/medium → SOC
  {
    types: [IncidentType.ACCOUNT_TAKEOVER],
    severities: [IncidentSeverity.LOW, IncidentSeverity.MEDIUM],
    destination: RoutingDestination.SOC,
    reasoning: [
      'SOC triage to confirm account compromise',
      'Password reset and session review recommended',
    ],
    escalationRequired: false,
    confidence: 0.82,
  },

  // Malware: high/critical → incident response
  {
    types: [IncidentType.MALWARE],
    severities: [IncidentSeverity.HIGH, IncidentSeverity.CRITICAL],
    destination: RoutingDestination.INCIDENT_RESPONSE,
    reasoning: [
      'Severe malware infection requires endpoint isolation',
      'Full forensic investigation of infection vector',
      'Lateral movement assessment required',
    ],
    escalationRequired: true,
    confidence: 0.92,
  },

  // Malware: low/medium → SOC
  {
    types: [IncidentType.MALWARE],
    severities: [IncidentSeverity.LOW, IncidentSeverity.MEDIUM],
    destination: RoutingDestination.SOC,
    reasoning: [
      'SOC to investigate suspicious software report',
      'Endpoint security scan recommended',
    ],
    escalationRequired: false,
    confidence: 0.85,
  },

  // Unauthorized access: high/critical → incident response
  {
    types: [IncidentType.UNAUTHORIZED_ACCESS],
    severities: [IncidentSeverity.HIGH, IncidentSeverity.CRITICAL],
    destination: RoutingDestination.INCIDENT_RESPONSE,
    reasoning: [
      'Unauthorized access at this severity requires formal investigation',
      'Access logs must be preserved and reviewed',
      'Lateral movement assessment required',
    ],
    escalationRequired: true,
    confidence: 0.90,
  },

  // Unauthorized access: low/medium → SOC
  {
    types: [IncidentType.UNAUTHORIZED_ACCESS],
    severities: [IncidentSeverity.LOW, IncidentSeverity.MEDIUM],
    destination: RoutingDestination.SOC,
    reasoning: [
      'SOC to investigate reported unauthorized access',
      'Review access logs and identify the access vector',
    ],
    escalationRequired: false,
    confidence: 0.82,
  },

  // Fraud: always fraud team
  {
    types: [IncidentType.FRAUD],
    severities: 'ALL',
    destination: RoutingDestination.FRAUD_TEAM,
    reasoning: [
      'Financial fraud requires specialist fraud investigation team',
      'Evidence must be collected for potential legal action',
    ],
    escalationRequired: false,
    confidence: 0.95,
  },

  // DoS/DDoS: always network security
  {
    types: [IncidentType.DENIAL_OF_SERVICE],
    severities: 'ALL',
    destination: RoutingDestination.NETWORK_SECURITY,
    reasoning: [
      'Denial of service requires network-level mitigation',
      'Traffic analysis and source blocking required',
    ],
    escalationRequired: false,
    confidence: 0.93,
  },

  // Social engineering: SOC
  {
    types: [IncidentType.SOCIAL_ENGINEERING],
    severities: 'ALL',
    destination: RoutingDestination.SOC,
    reasoning: [
      'Social engineering incident requires SOC investigation',
      'Verify whether any access or credentials were actually compromised',
    ],
    escalationRequired: false,
    confidence: 0.80,
  },

  // Suspicious link: SOC
  {
    types: [IncidentType.SUSPICIOUS_LINK],
    severities: 'ALL',
    destination: RoutingDestination.SOC,
    reasoning: [
      'Suspicious link report needs SOC review',
      'Verify link destination and assess threat level',
    ],
    escalationRequired: false,
    confidence: 0.78,
  },

  // OTHER / fallback: SOC
  {
    types: [IncidentType.OTHER],
    severities: 'ALL',
    destination: RoutingDestination.SOC,
    reasoning: [
      'Unclassified report forwarded to SOC for manual review',
      'Analyst should review and reclassify as needed',
    ],
    escalationRequired: false,
    confidence: 0.60,
  },
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Determine routing destination based on incident type and severity.
 * Returns the routing recommendation with reasoning.
 */
export function determineRouting(
  classification: ClassificationResult,
  severity: SeverityResult
): RoutingResult {
  const { type } = classification;
  const { severity: level } = severity;

  // Find the most specific matching rule
  let matchedRule: RoutingRule | undefined;

  for (const rule of ROUTING_RULES) {
    const typeMatches = rule.types.includes(type);
    const severityMatches =
      rule.severities === 'ALL' || rule.severities.includes(level);

    if (typeMatches && severityMatches) {
      matchedRule = rule;
      break;
    }
  }

  // Fallback if no rule matched (shouldn't happen due to OTHER catch-all)
  if (!matchedRule) {
    return {
      destination: RoutingDestination.SOC,
      confidence: 0.50,
      reasoning: ['No specific routing rule matched; defaulting to SOC for manual review'],
      escalationRequired: false,
    };
  }

  // Escalation override: CRITICAL severity always adds management escalation
  const escalationRequired =
    matchedRule.escalationRequired || level === IncidentSeverity.CRITICAL;

  const reasoning = [...matchedRule.reasoning];
  if (level === IncidentSeverity.CRITICAL && !matchedRule.escalationRequired) {
    reasoning.push('CRITICAL severity triggers management escalation notification');
  }

  return {
    destination: matchedRule.destination,
    confidence: matchedRule.confidence,
    reasoning,
    escalationRequired,
  };
}
