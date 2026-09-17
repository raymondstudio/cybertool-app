/**
 * Recommended Action Generator
 *
 * Produces actionable, type-specific next steps grounded in detected evidence.
 * Actions reference specific indicators found in the report.
 */

import { IncidentType, IncidentSeverity } from '@/types/incident';
import type { ClassificationResult, SeverityResult, ExtractedIndicator } from './types';

// ─── Base action templates ────────────────────────────────────────────────────

const ACTIONS: Record<IncidentType, string[]> = {
  [IncidentType.PHISHING]: [
    'Reset credentials for any accounts where the user may have entered their password.',
    'Invalidate all active sessions for the affected account.',
    'Block the malicious domain at the email gateway and web proxy.',
    'Search email logs for other users who received the same phishing message.',
    'Issue a security awareness alert to staff if multiple users are affected.',
    'Preserve the original phishing email as evidence.',
  ],
  [IncidentType.MALWARE]: [
    'Isolate the affected device from the network immediately.',
    'Run a full endpoint security scan on the affected system.',
    'Identify and block the malware hash at the endpoint security platform.',
    'Assess whether malware has spread to other devices via shared drives or network.',
    'Preserve disk image for forensic analysis before remediation.',
    'Review process execution logs to identify the infection vector.',
  ],
  [IncidentType.RANSOMWARE]: [
    'IMMEDIATELY isolate all affected systems from the network.',
    'Do NOT restart or shut down affected machines — preserve volatile evidence.',
    'Escalate to the incident response team and senior management.',
    'Identify the ransomware strain from ransom note and file extension.',
    'Check whether backups are intact and unaffected.',
    'Do NOT pay the ransom without senior management and legal approval.',
    'Preserve all ransom notes, encrypted file samples, and logs as evidence.',
    'Check for lateral movement to other systems.',
  ],
  [IncidentType.ACCOUNT_TAKEOVER]: [
    'Immediately reset the compromised account password.',
    'Revoke all active sessions and tokens for the account.',
    'Review recent account activity and access logs.',
    'Enforce multi-factor authentication if not already enabled.',
    'Check whether the attacker made privilege escalation attempts.',
    'Review what data or systems the compromised account had access to.',
  ],
  [IncidentType.DATA_BREACH]: [
    'Identify the scope of data exposed (records, types, individuals affected).',
    'Preserve evidence of the breach including logs and access records.',
    'Assess whether regulatory notification is required (DPA, GDPR, etc.).',
    'Notify affected individuals if personal data was exposed.',
    'Close the access vector that enabled the breach.',
    'Engage legal and privacy teams.',
    'Prepare a breach report for management and regulators.',
  ],
  [IncidentType.UNAUTHORIZED_ACCESS]: [
    'Terminate the unauthorised session immediately if still active.',
    'Review access logs to determine what systems and data were accessed.',
    'Identify the access vector and close it.',
    'Reset credentials for any accounts that may have been used.',
    'Check for persistence mechanisms (new accounts, scheduled tasks, backdoors).',
  ],
  [IncidentType.SOCIAL_ENGINEERING]: [
    'Verify whether any credentials or sensitive information was actually disclosed.',
    'If credentials were shared verbally, reset them immediately.',
    'Report the incident to the phone/comms provider if applicable.',
    'Issue a staff awareness notice to prevent others from being targeted.',
    'Confirm the identity of the caller or contact if possible.',
  ],
  [IncidentType.SUSPICIOUS_LINK]: [
    'Do NOT click the link further until analysis is complete.',
    'Submit the link to a sandboxing service or threat intelligence platform.',
    'Block the domain at the web proxy and email gateway.',
    'Check whether any other users clicked the same link.',
    'Determine whether any user submitted credentials or data via the link.',
  ],
  [IncidentType.INSIDER_THREAT]: [
    'Do NOT alert the suspected insider at this stage — preserve investigation integrity.',
    'Collect and preserve all evidence of the suspicious activity.',
    'Review access logs, data transfer logs, and email records.',
    'Engage HR and legal teams as appropriate.',
    'Assess what data or systems the individual had access to.',
    'Consider whether to revoke access pending investigation.',
  ],
  [IncidentType.FRAUD]: [
    'Report the fraud to the financial institution immediately.',
    'Collect all evidence (transaction records, emails, account details).',
    'Engage the fraud investigation team.',
    'Preserve evidence for potential law enforcement involvement.',
    'Review how the fraud was enabled and close the control gap.',
  ],
  [IncidentType.DENIAL_OF_SERVICE]: [
    'Engage the network team to implement traffic filtering or rate limiting.',
    'Work with ISP or DDoS mitigation provider if attack is volumetric.',
    'Identify the attack source and block at network perimeter.',
    'Scale infrastructure or redirect traffic if capacity is overwhelmed.',
    'Preserve network traffic logs for forensic analysis.',
  ],
  [IncidentType.OTHER]: [
    'Review the report manually and reclassify into the appropriate incident type.',
    'Gather additional information from the reporter.',
    'Assess whether this is a real incident or a false positive.',
    'Assign the correct response team based on further investigation.',
  ],
};

// ─── Dynamic action builder ───────────────────────────────────────────────────

/**
 * Generate recommended actions for an incident.
 * Actions are grounded in detected indicators and severity.
 */
export function generateRecommendedAction(
  classification: ClassificationResult,
  severity: SeverityResult,
  indicators: ExtractedIndicator[]
): string {
  const baseActions = ACTIONS[classification.type] || ACTIONS[IncidentType.OTHER];

  // Build the action list
  const actionList: string[] = [];

  // Severity-specific urgency prefix
  if (severity.severity === IncidentSeverity.CRITICAL) {
    actionList.push('⚠ CRITICAL — Take immediate action. Do not wait for further investigation before starting containment.');
  } else if (severity.severity === IncidentSeverity.HIGH) {
    actionList.push('Urgent — Begin response within 1 hour.');
  }

  // Add base actions
  actionList.push(...baseActions);

  // Add indicator-specific actions
  const domains = indicators.filter(
    (i) => (i.type === 'DOMAIN' || i.type === 'URL') && i.isMalicious
  );
  if (domains.length > 0) {
    const domainList = domains
      .slice(0, 3)
      .map((d) => d.value)
      .join(', ');
    actionList.push(`Block the following indicators at network and email security controls: ${domainList}`);
  }

  const hashes = indicators.filter((i) => i.type === 'HASH');
  if (hashes.length > 0) {
    actionList.push(
      `Submit the following file hashes to threat intelligence and block at endpoint: ${hashes
        .slice(0, 2)
        .map((h) => h.value)
        .join(', ')}`
    );
  }

  // Format as numbered list
  return actionList
    .map((action, idx) => `${idx + 1}. ${action}`)
    .join('\n');
}
