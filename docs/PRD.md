# Sentria — Product Requirements Document (PRD)

**Project**: Sentria  
**Challenge**: D1 — Sorting Incident Reports Nobody Has Time to Read  
**Track**: Government & Public Sector  
**Submission Deadline**: September 18, 2026  
**Team Size**: 2–3 developers  
**Status**: ACTIVE DEVELOPMENT

---

## Executive Summary

Sentria is an AI-assisted cybersecurity incident triage platform that transforms messy, unstructured incident reports into structured, prioritized, analyst-ready intelligence.

**Problem**: Security analysts and CERT teams receive large volumes of poorly written incident reports (typos, grammar issues, mixed languages, PII, duplicate submissions, unclear severity). Manual reading and interpretation wastes time and introduces inconsistency.

**Solution**: Automated analysis pipeline that classifies incidents, calculates severity with explainable reasoning, extracts technical indicators, detects and redacts PII, identifies duplicates/related reports, and routes incidents to the right team.

**Core Outcome**: Analysts see a prioritized queue of incidents with high-risk, actionable reports at the top — not chronological order.

---

## Problem Statement

### Current State (Hackathon Challenge D1)
- Incident reports arrive as messy text messages, emails, screenshots
- Written by non-security experts; may include Pidgin English or colloquialisms
- Often contain sensitive personal information (names, phone numbers, IDs)
- Duplicate reports exist for the same underlying incident (submitted by different users)
- No structured classification or severity assessment
- No automatic extraction of technical indicators (domains, IPs, URLs, hashes)
- No automated PII detection or redaction
- Analysts manually read every report before deciding what to do
- High risk of missing critical incidents buried in a large queue
- No correlation of related incidents into campaigns

### Desired State
- Raw report → Automated analysis → Structured, prioritized incident record
- Analysts see critical incidents first (by risk score, not arrival time)
- PII is detected and redacted; analyst sees sanitized version
- Technical indicators are extracted and highlighted
- Duplicate reports are detected and clustered
- Each incident has a recommended next action and routing destination
- System performance is measurable against ground-truth dataset

---

## Product Vision

Sentria delivers **incident intelligence, not just incident logging**.

Analysts interact with the platform to:
1. **Submit** a raw incident report (text)
2. **Receive** structured analysis immediately (type, severity, indicators, PII status, routing)
3. **Review** the incident in detail with clear reasoning
4. **Correlate** it with related incidents and identify campaigns
5. **Act** based on recommended actions and routing guidance
6. **Track** the incident through workflow states (NEW → TRIAGED → INVESTIGATING → RESOLVED)

The system prioritizes **actionability** over features.

---

## Target Users

### Primary: Security Analysts (SOC Tier 1/2)
- Need to triage large incident queues quickly
- Rely on structured data to make routing decisions
- Benefit from automated PII redaction (work with compliance/privacy teams)
- Want to see high-risk incidents first

### Secondary: CERT Team / Incident Responders
- Need to identify related incidents and campaigns
- Benefit from correlation and clustering
- Use technical indicators to investigate infrastructure
- Need explainable severity scores for stakeholder communication

### Tertiary: Security Operations Management
- Monitor incident volume and trends
- Measure analyst throughput and accuracy
- Report on incident types and severity distribution
- Evaluate system performance on test dataset

---

## User Personas

### Persona 1: Chidi (CERT Analyst, Federal Government)
- 4 years incident response experience
- Receives 50–100 reports per day across different channels
- Needs system to immediately identify critical incidents
- Values speed and accuracy; dislikes ambiguity
- **Need**: "Show me what needs immediate attention, and tell me why."

### Persona 2: Ada (SOC Tier 1, Private Sector)
- 1 year in SOC, learning cybersecurity
- Often unsure whether a report is serious
- Relies on routing and recommended actions
- Worried about missing something important
- **Need**: "Tell me what this means and who should handle it."

### Persona 3: Obi (Security Manager)
- Oversees 5 analysts
- Needs to report on incident trends and system performance
- Wants metrics to justify budget for security tools
- **Need**: "Show me volume, severity distribution, and system accuracy."

---

## User Stories

### Epic 1: Incident Submission & Analysis

**US-1.1**: Analyst submits raw incident report
- As an analyst, I want to submit a raw incident report (text or file) so the system can analyze it.
- **Acceptance Criteria**:
  - Large text area accepts unstructured reports
  - System accepts reports up to 10,000 characters
  - Analysis begins immediately upon submission
  - Analyst sees a loading indicator during processing
  - System returns analysis within 10 seconds

**US-1.2**: System classifies incident and provides confidence
- As the system, I will classify the incident into a predefined taxonomy with confidence % so the analyst knows how certain the classification is.
- **Acceptance Criteria**:
  - Classification is one of: PHISHING, MALWARE, RANSOMWARE, ACCOUNT_TAKEOVER, DATA_BREACH, UNAUTHORIZED_ACCESS, SOCIAL_ENGINEERING, SUSPICIOUS_LINK, INSIDER_THREAT, FRAUD, DENIAL_OF_SERVICE, OTHER
  - Confidence is a percentage (0–100%)
  - Confidence > 70% is considered actionable
  - Confidence between 50–70% triggers manual review flag

**US-1.3**: System calculates severity with explicit reasoning
- As the system, I will assign a severity level (LOW, MEDIUM, HIGH, CRITICAL) with documented reasoning so the analyst understands why the incident is serious (or not).
- **Acceptance Criteria**:
  - Severity is based on rule-based scoring (0–100 scale)
  - Score thresholds: 0–24=LOW, 25–49=MEDIUM, 50–74=HIGH, 75–100=CRITICAL
  - System provides 3–5 bullet-point reasons explaining the severity
  - Reasons reference specific incident characteristics (credential compromise, active compromise, system criticality, etc.)
  - Analyst can see the reasoning on the detail page

**US-1.4**: System extracts technical indicators
- As the system, I will identify and extract technical indicators (domains, IPs, URLs, hashes, emails, phone numbers, hostnames) so the analyst can take action.
- **Acceptance Criteria**:
  - Each indicator includes: type, value, context (where/how it was mentioned)
  - Confidence scoring for each indicator where applicable
  - Indicators are clearly distinguishable from other text
  - System preserves context ("redirected to this domain after clicking link")
  - Indicators are copyable to clipboard

**US-1.5**: System detects and redacts PII
- As the system, I will identify personal information (names, phone numbers, IDs, addresses) and redact it from a sanitized report so sensitive data is not exposed to unauthorized viewers.
- **Acceptance Criteria**:
  - PII types detected: names, phone numbers, email addresses, student/staff IDs, account numbers, addresses
  - Redaction placeholders: [PERSON], [PHONE], [REDACTED], etc.
  - Original report is preserved separately (for audit/investigation)
  - Sanitized report is suitable for sharing with non-security stakeholders
  - Technical context is preserved (domains are not redacted even if they look like names)

**US-1.6**: System recommends routing and next action
- As the system, I will recommend which team should receive the incident (SOC, Incident Response, Identity Security, Fraud Team, etc.) and suggest the next action so the analyst knows what to do.
- **Acceptance Criteria**:
  - Routing is deterministic based on incident type and severity
  - Recommended actions are specific to the incident type (e.g., "Reset credentials, invalidate sessions, block domain" for phishing)
  - Analyst can see routing reasoning on the detail page
  - Routing recommendation is highlighted on the queue view

---

### Epic 2: Incident Queue & Prioritization

**US-2.1**: Analyst views prioritized incident queue
- As an analyst, I want to see incidents sorted by risk (highest first), not arrival time, so I focus on the most serious incidents first.
- **Acceptance Criteria**:
  - Default sort: CRITICAL incidents at top, then HIGH, then MEDIUM, then LOW
  - Within each severity level, sort by risk score (descending)
  - Analysts can change sort order (by type, by date, by status, etc.)
  - Queue displays: ID, Type, Severity, Risk Score, Summary, Timestamp, Status, Route
  - Color-coding by severity (red=CRITICAL, orange=HIGH, yellow=MEDIUM, green=LOW)
  - Pagination or infinite scroll for large queues (50+ incidents visible without scroll)

**US-2.2**: Analyst searches and filters incident queue
- As an analyst, I want to search and filter the queue (by severity, type, status, team, keywords) so I can find specific incidents quickly.
- **Acceptance Criteria**:
  - Search by: incident ID, summary text, IOC, analyst notes
  - Filter by: severity, type, status, routing destination, date range
  - Filters can be combined (e.g., "HIGH severity AND phishing type")
  - Results update in < 500ms
  - No false negatives (all matching incidents appear)

**US-2.3**: Analyst clicks incident to view full details
- As an analyst, I want to click an incident to see its full analysis (classification, severity reasoning, indicators, PII, related incidents, routing, recommended action).
- **Acceptance Criteria**:
  - Detail page loads in < 2 seconds
  - All analysis fields are visible
  - Original and sanitized reports are side-by-side and clearly labeled
  - Analyst can navigate back to queue without losing filter/sort state
  - Analyst can change incident status (NEW → TRIAGED → INVESTIGATING → RESOLVED)
  - Analyst can add notes to the incident

**US-2.4**: Analyst marks incident status
- As an analyst, I want to change an incident's status (NEW → TRIAGED → INVESTIGATING → ESCALATED → RESOLVED → FALSE_POSITIVE) to track workflow.
- **Acceptance Criteria**:
  - Status changes are persisted to database
  - Status history is visible on detail page
  - Analyst can filter queue by status
  - System can report on average time in each status

---

### Epic 3: Incident Correlation & Clustering

**US-3.1**: System detects duplicate reports
- As the system, I will identify exact and near-duplicate incident reports so the analyst sees them as related.
- **Acceptance Criteria**:
  - Exact duplicates detected with 100% precision
  - Near-duplicates (typos, slight wording variations) flagged with similarity score
  - Duplicates are linked but not auto-merged (analyst reviews)
  - Similarity score is visible in UI (0–100%)
  - False positive rate < 5% (manual testing)

**US-3.2**: System clusters related incidents
- As the system, I will group related incidents (same campaign, same infrastructure) into clusters so the analyst sees patterns.
- **Acceptance Criteria**:
  - Clusters are created automatically based on: IOC overlap, semantic similarity, incident type
  - Each cluster has a unique ID, count of incidents, severity distribution
  - Cluster view shows timeline, common indicators, affected organizations
  - Analyst can manually link/unlink incidents from clusters
  - Cluster assignment is visible on queue and detail views

**US-3.3**: Analyst views clusters
- As an analyst, I want to view clusters to understand campaign scope and patterns.
- **Acceptance Criteria**:
  - Cluster list page shows: ID, name, incident count, type, highest severity, most common IOCs
  - Cluster detail page shows: all related incidents, timeline, IOC summary, affected orgs
  - Analyst can navigate from cluster to incident to queue seamlessly
  - Clustering algorithm is documented (methodology, thresholds)

---

### Epic 4: Dashboard & Metrics

**US-4.1**: Analyst views operational dashboard
- As an analyst, I want to see a dashboard showing incident volume, severity distribution, and what needs attention right now.
- **Acceptance Criteria**:
  - Displays: Total reports, CRITICAL count, HIGH count, Awaiting triage, Active clusters, PII detections, Avg latency
  - Charts: Incident type distribution (pie/bar), severity over time (line), by status
  - Priority queue preview: Top 10 incidents by risk score
  - Quick-action buttons: Submit Report, View All Incidents, View Clusters, View Evaluation
  - Dashboard loads in < 2 seconds
  - All numbers are real (from database, not hardcoded)

**US-4.2**: Manager views evaluation metrics
- As a manager, I want to see system performance metrics (classification accuracy, PII detection precision, duplicate detection recall) so I can evaluate the system against a test dataset.
- **Acceptance Criteria**:
  - Evaluation page displays: Classification accuracy/precision/recall/F1, confusion matrices
  - Severity metrics: Accuracy, macro F1, confusion matrix
  - IOC extraction metrics: Precision, recall, F1 per type
  - PII detection metrics: Precision, recall, false positives, false negatives
  - Duplicate detection metrics: Precision, recall, false merge rate
  - Performance metrics: Mean latency, P95 latency, throughput
  - Known failure cases are documented (be honest about what fails)
  - Results can be exported as JSON

---

## Functional Requirements

### FR-1: Incident Submission
- Accept raw incident report (text, up to 10,000 chars)
- Validate input (not empty, not spam)
- Return error if input is invalid

### FR-2: Incident Analysis
- Classify incident into taxonomy
- Calculate severity score with reasoning
- Extract technical indicators
- Detect PII and redact
- Summarize incident
- Recommend routing and action
- Return analysis in < 10 seconds (target latency)

### FR-3: Persistence
- Store original report, analysis, indicators, PII metadata, sanitized report
- Assign unique incident ID
- Record timestamp
- Support status tracking (NEW, TRIAGED, INVESTIGATING, ESCALATED, RESOLVED, FALSE_POSITIVE)

### FR-4: Incident Queue
- List incidents with pagination
- Sort by risk score (default), allow other sort options
- Filter by severity, type, status, route, date
- Search by ID, summary, IOC
- Color-code by severity

### FR-5: Incident Detail
- Display all analysis fields
- Show original and sanitized reports side-by-side
- Allow status change
- Show related incidents
- Show cluster assignment
- Allow analyst notes

### FR-6: Clustering
- Detect exact and near-duplicate reports
- Group related incidents by campaign
- Assign cluster IDs
- Calculate similarity scores

### FR-7: Dashboard
- Show incident metrics
- Display severity distribution
- Show active clusters
- Preview priority queue
- Real-time metric updates

### FR-8: Evaluation
- Run full analysis pipeline on test dataset
- Calculate classification metrics (accuracy, precision, recall, F1)
- Calculate severity metrics
- Calculate IOC extraction metrics
- Calculate PII detection metrics
- Calculate duplicate detection metrics
- Generate performance metrics
- Display results with known failure cases

---

## Non-Functional Requirements

### NFR-1: Performance
- **Latency**: < 10 seconds per incident analysis (acceptable for hackathon)
- **Throughput**: Process 100+ reports per hour
- **Availability**: 99% uptime (for hackathon duration)
- **Scalability**: Support 1,000+ incidents in database without performance degradation

### NFR-2: Security
- **API Keys**: Never expose Gemini API key or Supabase credentials to frontend
- **Secrets Management**: Store in environment variables, never commit to git
- **Input Validation**: Validate all API inputs with Zod
- **Output Validation**: Validate AI-generated output before storing/displaying
- **XSS Prevention**: Sanitize displayed report content
- **SQL Injection**: Use parameterized queries (Supabase client handles this)
- **Rate Limiting**: Limit API calls per analyst (prevent abuse)
- **Logging**: Log incidents but never log raw sensitive reports in production
- **PII Protection**: Clearly separate original and sanitized reports; redact in shared views

### NFR-3: Reliability
- **Error Handling**: Never silently fail; always provide error message to user
- **Graceful Degradation**: If Gemini API is unavailable, fall back to rule-based classification
- **Data Integrity**: Database transactions ensure consistency
- **Reproducibility**: Evaluation runs produce same results on same dataset

### NFR-4: Maintainability
- **Type Safety**: Strict TypeScript, zero `any` (documented exceptions only)
- **Code Organization**: Separation of concerns (UI, API, business logic, data layers)
- **Documentation**: PRD, API documentation, dataset methodology, evaluation results
- **Testing**: Unit tests for critical logic (classification, severity, IOC extraction, PII)
- **Git Hygiene**: Meaningful commits, feature branches, clean history

### NFR-5: Accessibility
- **WCAG 2.1 Level AA**: Color-blind safe palettes, keyboard navigation, ARIA labels
- **Responsive**: Mobile and tablet friendly
- **Performance**: Page loads < 2 seconds on 4G

---

## Incident Taxonomy

All incident types are defined as a TypeScript enum. This ensures type safety and prevents arbitrary string categorization.

```typescript
enum IncidentType {
  PHISHING = "PHISHING",
  MALWARE = "MALWARE",
  RANSOMWARE = "RANSOMWARE",
  ACCOUNT_TAKEOVER = "ACCOUNT_TAKEOVER",
  DATA_BREACH = "DATA_BREACH",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  SOCIAL_ENGINEERING = "SOCIAL_ENGINEERING",
  SUSPICIOUS_LINK = "SUSPICIOUS_LINK",
  INSIDER_THREAT = "INSIDER_THREAT",
  FRAUD = "FRAUD",
  DENIAL_OF_SERVICE = "DENIAL_OF_SERVICE",
  OTHER = "OTHER",
}
```

**Rationale**:
- **PHISHING**: Fraudulent attempt to steal credentials via email, link, or domain
- **MALWARE**: Malicious software (worms, trojans, spyware, etc.)
- **RANSOMWARE**: Encryption-based extortion attack
- **ACCOUNT_TAKEOVER**: Unauthorized access to user account
- **DATA_BREACH**: Unauthorized access or exfiltration of sensitive data
- **UNAUTHORIZED_ACCESS**: Access to systems without permission (not data exfiltration)
- **SOCIAL_ENGINEERING**: Manipulation to bypass security (not phishing-specific)
- **SUSPICIOUS_LINK**: Link that appears malicious but classification uncertain
- **INSIDER_THREAT**: Malicious activity by authorized user
- **FRAUD**: Financial or identity fraud
- **DENIAL_OF_SERVICE**: Attempt to make systems unavailable
- **OTHER**: Incident that doesn't fit predefined categories

**Extension**: New types can be added to the enum if needed. All downstream code references the enum, ensuring consistency.

---

## Severity Model

Severity is calculated using a rule-based scoring system (0–100). This ensures explainability and reproducibility.

### Severity Levels

```typescript
enum IncidentSeverity {
  LOW = "LOW",           // 0–24
  MEDIUM = "MEDIUM",     // 25–49
  HIGH = "HIGH",         // 50–74
  CRITICAL = "CRITICAL", // 75–100
}
```

### Severity Scoring Factors

Each factor contributes points to the final score.

| Factor | Max Points | Rationale |
|--------|-----------|-----------|
| **Credential Compromise** | 25 | Credentials submitted to unauthorized domain; most serious indicator |
| **Active Compromise** | 20 | Evidence of ongoing unauthorized access; requires immediate response |
| **System Criticality** | 15 | Incident involves payroll, identity, financial, or critical infrastructure |
| **Affected User Count** | 15 | Number of users impacted; scales impact |
| **Ransomware Indicators** | 15 | Encryption demands, ransom notes, file extensions associated with ransomware |
| **Financial Impact** | 5 | Evidence of money lost or at risk |
| **Data Exposure Risk** | 5 | Risk that sensitive data is exposed (even if not confirmed) |

**Total**: 100 points

### Severity Thresholds

```
0–24   = LOW         (Can wait; not urgent)
25–49  = MEDIUM      (Should investigate; standard priority)
50–74  = HIGH        (Urgent; investigate immediately)
75–100 = CRITICAL    (Emergency; escalate immediately)
```

### Example Scoring

**Report**: "User submitted credentials to fake payroll login"

- Credential Compromise: +25 (credentials were entered)
- System Criticality: +15 (payroll system involved)
- Active Compromise: +10 (potential account takeover in progress)
- **Total Score**: 50 → **HIGH severity**

**Reasons**:
- Credentials were submitted to a suspected fraudulent domain
- Potential account takeover is active or imminent
- Payroll system is a critical business system

---

### Severity Reasoning Output

For every incident, the system outputs a `severityReasons` array:

```typescript
severityReasons: [
  "Credentials were submitted to a suspected fraudulent domain",
  "Potential account takeover is active",
  "Payroll system is involved"
]
```

This allows analysts to understand **why** the system assigned a particular severity.

---

## Technical Indicator Extraction

The system identifies and extracts technical indicators from natural-language reports.

### Supported IOC Types

```typescript
enum IndicatorType {
  DOMAIN = "DOMAIN",
  URL = "URL",
  IPV4 = "IPV4",
  IPV6 = "IPV6",
  EMAIL = "EMAIL",
  HASH = "HASH",           // MD5, SHA1, SHA256, etc.
  PHONE = "PHONE",
  USERNAME = "USERNAME",
  HOSTNAME = "HOSTNAME",
  FILENAME = "FILENAME",
  FILE_EXTENSION = "FILE_EXTENSION",
}
```

### Indicator Record Structure

```typescript
interface TechnicalIndicator {
  type: IndicatorType;
  value: string;
  context: string;                 // Where/how it appeared in the report
  confidence?: number;              // 0–100%, if applicable
  isMalicious?: boolean;            // True if likely malicious
}
```

### Extraction Strategy

**Deterministic (Regex)**:
- URLs: `https://...`, `http://...`, `www.example.com`
- Domains: Regex + TLD validation
- IPv4: `192.168.1.1` format
- Email: `user@domain.com` format
- Phone: Various regional formats (Nigerian: +234...)
- File hashes: MD5 (32 hex), SHA1 (40 hex), SHA256 (64 hex)
- Filenames: `.exe`, `.zip`, `.dll`, etc.

**AI-Assisted (Gemini)**:
- Contextual IOC extraction (when report mentions "sent from server 192.168.1.1")
- Distinguishing IOC from PII (email is IOC if suspicious, PII if personal)
- Extracting malformed or misspelled indicators

### Example Extraction

**Report**: "User received email from admin@payroll-secure.com requesting password reset. Clicked link to evil-payroll.net."

**Extracted Indicators**:
```json
[
  {
    "type": "EMAIL",
    "value": "admin@payroll-secure.com",
    "context": "Sender of phishing email",
    "isMalicious": true
  },
  {
    "type": "DOMAIN",
    "value": "payroll-secure.com",
    "context": "Email sender domain",
    "isMalicious": true
  },
  {
    "type": "DOMAIN",
    "value": "evil-payroll.net",
    "context": "Malicious destination after clicking link",
    "isMalicious": true
  }
]
```

---

## PII Detection & Redaction

The system detects sensitive personal information and redacts it from reports shared with non-security stakeholders.

### PII Categories

```typescript
enum PiiType {
  PERSON_NAME = "PERSON_NAME",
  PHONE_NUMBER = "PHONE_NUMBER",
  EMAIL_ADDRESS = "EMAIL_ADDRESS",
  STUDENT_ID = "STUDENT_ID",
  STAFF_ID = "STAFF_ID",
  ACCOUNT_NUMBER = "ACCOUNT_NUMBER",
  ADDRESS = "ADDRESS",
  CREDIT_CARD = "CREDIT_CARD",
  SSN = "SSN",
}
```

### Redaction Rules

| PII Type | Pattern | Redaction |
|----------|---------|-----------|
| Person Name | "John Doe", "Chidi Okafor" | [PERSON] |
| Phone Number | "+234 812 345 6789", "08123456789" | [PHONE] |
| Email Address | "user@example.com" (personal) | [REDACTED] |
| Student ID | "A123456" | [STUDENT_ID] |
| Account Number | "ACC-12345-678" | [ACCOUNT] |
| Address | "123 Main St, Lagos" | [ADDRESS] |
| Credit Card | "4532-1234-5678-9010" | [CREDIT_CARD] |
| SSN | "123-45-6789" | [SSN] |

### Context-Aware Detection

**Important**: Not every email or phone is PII.

- **IOC** (redact as PII): "User received email from fake-admin@payroll.com" → "User received email from [REDACTED]" (the domain is the attacker, but may need context)
- **Mixed**: "User received email from admin@payroll.com requesting password" → "User received email from [EMAIL_ADDRESS] requesting password" (suspicious email is IOC; admin@payroll may be internal)

The system distinguishes context:
- **Technical indicator**: "Phishing domain evil-payroll.com" (keep)
- **Personal information**: "Victim's personal email john@gmail.com" (redact)

### Sanitized Report Example

**Original**:
```
John Doe from Finance, phone 08012345678, email john.doe@example.com, 
tried to login at payroll-login-secure.com. He entered his password at 
08:15 AM on Sep 7. The URL was slightly different from normal. 
He noticed it was evil.
```

**Sanitized**:
```
[PERSON] from Finance, phone [PHONE], email [REDACTED],
tried to login at payroll-login-secure.com. [PERSON] entered credentials at
08:15 AM on Sep 7. The URL was slightly different from normal.
[PERSON] noticed it was suspicious.
```

### PII Metadata Output

```typescript
interface PiiDetection {
  type: PiiType;
  originalValue: string;          // Never displayed in UI; used for audit
  context: string;                // Where PII appeared
  redactedText: string;           // [PERSON], [PHONE], etc.
  confidence: number;             // 0–100%
}
```

---

## Incident Correlation & Clustering

The system detects related incidents and groups them into clusters representing campaigns or related events.

### Similarity Calculation

Similarity is calculated on a 0–1 scale using multiple factors:

1. **Exact Text Match**: Same report text (100% match)
2. **Edit Distance**: Levenshtein distance (typo tolerance)
3. **IOC Overlap**: Shared technical indicators (same domains, IPs, etc.)
4. **Semantic Similarity**: Using Gemini embeddings or TF-IDF
5. **Metadata Match**: Same user, same target system, same time window

### Similarity Score Formula

```
similarity = (0.3 × exact_match + 0.2 × edit_distance + 0.3 × ioc_overlap + 0.2 × semantic_similarity)
```

### Duplicate Detection

**Exact Duplicates**: similarity > 0.95
- Same report submitted by multiple users
- **Action**: Cluster into same incident; flag as duplicate

**Near-Duplicates**: similarity 0.75–0.95
- Same incident, different wording
- Typos, minor variations
- **Action**: Flag as probable duplicate; allow analyst review

**Related Incidents**: similarity 0.50–0.75
- Same campaign or attack pattern
- **Action**: Suggest clustering; analyst confirms

**Unrelated**: similarity < 0.50
- Different incidents
- **Action**: Keep separate

### Clustering Algorithm

**Approach**: Single-linkage clustering (agglomerative, threshold-based)

```
For each new incident:
  Find all incidents with similarity > 0.50
  If incident connects to existing cluster:
    Add to cluster
  Else:
    Create new cluster
```

### Cluster Structure

```typescript
interface Cluster {
  id: string;                        // CLUSTER-001, etc.
  name?: string;                     // "Payroll Phishing Campaign", auto-generated
  incidentIds: string[];             // All incident IDs in cluster
  incidentCount: number;
  incidentType: IncidentType;        // Dominant type
  highestSeverity: IncidentSeverity;
  commonIndicators: TechnicalIndicator[];
  severityDistribution: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  affectedOrganizations: string[];   // If applicable
  timelineStart: Date;
  timelineEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### False Merge Prevention

- **High similarity threshold** (> 0.85 for auto-merge)
- **Manual review** before merge
- **Test metric**: False merge rate < 5% on test set
- **Analyst control**: Can manually unlink incidents from clusters

---

## Routing Model

Each incident receives a recommended destination based on type and severity.

### Routing Destinations

```typescript
enum RoutingDestination {
  SOC = "SOC",                          // Security Operations Center (general triage)
  INCIDENT_RESPONSE = "INCIDENT_RESPONSE", // Major incidents requiring investigation
  IDENTITY_SECURITY = "IDENTITY_SECURITY", // Account takeover, credential issues
  EMAIL_SECURITY = "EMAIL_SECURITY",   // Phishing, spam, email security
  NETWORK_SECURITY = "NETWORK_SECURITY", // Network-level attacks, DDoS
  FRAUD_TEAM = "FRAUD_TEAM",            // Financial fraud
  IT_SUPPORT = "IT_SUPPORT",            // User support, reset passwords
  MANAGEMENT = "MANAGEMENT",            // Executive escalation, PR
  LEGAL_PRIVACY = "LEGAL_PRIVACY",      // Data breach, compliance, privacy issues
  OTHER = "OTHER",
}
```

### Routing Rules

| Incident Type | Severity | Destination | Rationale |
|---------------|----------|-------------|-----------|
| PHISHING | HIGH/CRITICAL | EMAIL_SECURITY, SOC | Email security handles filtering; SOC triages |
| PHISHING | LOW/MEDIUM | SOC | Standard triage |
| MALWARE | HIGH/CRITICAL | INCIDENT_RESPONSE | Malware requires investigation |
| MALWARE | LOW/MEDIUM | SOC | Standard triage |
| RANSOMWARE | ANY | INCIDENT_RESPONSE | Always escalate |
| ACCOUNT_TAKEOVER | HIGH/CRITICAL | IDENTITY_SECURITY | Account security team |
| DATA_BREACH | ANY | INCIDENT_RESPONSE, LEGAL_PRIVACY | Major incident + compliance |
| UNAUTHORIZED_ACCESS | HIGH/CRITICAL | INCIDENT_RESPONSE | Investigation required |
| FRAUD | ANY | FRAUD_TEAM | Specialized team |
| INSIDER_THREAT | ANY | INCIDENT_RESPONSE | Investigation required |
| DENIAL_OF_SERVICE | ANY | NETWORK_SECURITY | Network team |

### Routing Output

```typescript
interface RoutingRecommendation {
  destination: RoutingDestination;
  confidence: number;              // 0–100%
  reasoning: string[];             // Why this destination (bulleted)
  escalationRequired: boolean;      // Route to management if true
}
```

---

## Queue Model

The incident queue is the analyst's primary interface. It must prioritize **urgent incidents** over arrival time.

### Default Sort Order

1. **Severity Level** (CRITICAL → HIGH → MEDIUM → LOW)
2. **Risk Score** (within severity level, descending)
3. **Timestamp** (within risk score, newest first)

### Queue Display Fields

| Field | Type | Purpose |
|-------|------|---------|
| Incident ID | String | Unique reference |
| Type | IncidentType | Incident classification |
| Severity | IncidentSeverity | Color-coded urgency |
| Risk Score | Number | 0–100 numeric risk |
| Summary | String | 1-line incident description (truncated) |
| Timestamp | DateTime | When report was submitted |
| Status | Status | NEW, TRIAGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE |
| Route | RoutingDestination | Recommended team |
| Cluster | String | Cluster ID if part of cluster |

### Status Lifecycle

```
NEW → TRIAGED → INVESTIGATING → RESOLVED
              ↘
                FALSE_POSITIVE
```

Or:

```
NEW → TRIAGED → ESCALATED → RESOLVED
```

### Filter/Search Capabilities

- **Filter by Severity**: Show only HIGH + CRITICAL
- **Filter by Type**: Show only PHISHING
- **Filter by Status**: Show only NEW (awaiting triage)
- **Filter by Route**: Show only SOC-assigned incidents
- **Filter by Date Range**: Last 24 hours, last 7 days, custom
- **Search by ID**: "INC-0042"
- **Search by IOC**: "payroll-login-secure.com"
- **Search by Summary**: Text search in incident summaries

---

## Dashboard Model

The dashboard provides **situational awareness** for analysts and managers.

### Metrics

**For Analysts (SOC Tier 1/2)**:
- Total incidents processed today
- **CRITICAL incidents** (count, prominently displayed)
- **HIGH incidents** (count)
- Incidents awaiting triage (NEW status count)
- Average time to triage
- Average processing latency

**For Managers**:
- Total incidents processed (this period)
- Incident type distribution (pie/bar chart)
- Severity distribution over time (line chart)
- Incidents by status (stacked bar)
- Active clusters count
- Duplicate reports detected (this period)
- PII detections (count)
- System uptime %

### Priority Queue Preview

Show top 10 incidents by risk score with:
- Incident ID
- Type
- Severity (color-coded)
- Risk Score
- Summary
- "View Full Queue" link

---

## Evaluation Model

The system is evaluated against a synthetic labeled dataset to measure performance.

### Test Dataset

**Size**: 500–1,000 incidents (target: 800)  
**Split**: 80% train, 20% test (no data leakage)

**Composition**:
- All incident types represented
- All severity levels represented
- 20% duplicates (exact and near)
- 15% with false positives
- 10% with edge cases (ambiguous, mixed language)
- 10% with PII
- Minimum 50 chars, maximum 2,000 chars per report
- Realistic: typos, grammar issues, mixed English/Pidgin

**Ground Truth**:
- Correct incident type
- Correct severity
- Expected technical indicators
- Expected PII categories
- Related incident IDs
- Cluster ID (for duplicates)
- Correct routing destination

### Metrics

#### Classification
- **Accuracy**: (TP + TN) / Total
- **Precision per type**: TP / (TP + FP) for each incident type
- **Recall per type**: TP / (TP + FN) for each incident type
- **F1 per type**: 2 × (Precision × Recall) / (Precision + Recall)
- **Confusion matrix**: Predicted vs. actual for all types

#### Severity
- **Accuracy**: (TP + TN) / Total
- **Macro F1**: Average F1 across all severity levels
- **Confusion matrix**: Predicted vs. actual severity

#### IOC Extraction
- **Precision**: Extracted IOCs that are correct / Total extracted
- **Recall**: Extracted IOCs / All expected IOCs
- **F1**: Harmonic mean of precision and recall
- **Per-type metrics**: Separate calculations for domains, IPs, emails, etc.

#### PII Detection
- **Precision**: Detected PII that is correct / Total detected
- **Recall**: Detected PII / All expected PII
- **False Positives**: Incorrectly flagged PII
- **False Negatives**: Missed PII

#### Duplicate Detection
- **Precision**: Flagged duplicates that are correct / Total flagged
- **Recall**: Flagged duplicates / All true duplicates
- **False Merge Rate**: Incorrectly merged incidents / Total merges
- **Missed Duplicate Rate**: Undetected duplicates / All true duplicates

#### Performance
- **Mean Latency**: Average time to analyze per incident (seconds)
- **P95 Latency**: 95th percentile latency (seconds)
- **Throughput**: Reports processed per minute
- **Availability**: Uptime % during test period

### Evaluation Output

```typescript
interface EvaluationResult {
  runDate: Date;
  datasetSize: number;
  trainingSetSize: number;
  testSetSize: number;
  
  classification: {
    accuracy: number;
    macroF1: number;
    perTypeMetrics: Record<IncidentType, { precision: number; recall: number; f1: number }>;
    confusionMatrix: number[][];
  };
  
  severity: {
    accuracy: number;
    macroF1: number;
    confusionMatrix: number[][];
  };
  
  iocExtraction: {
    precision: number;
    recall: number;
    f1: number;
    perTypeMetrics: Record<IndicatorType, { precision: number; recall: number; f1: number }>;
  };
  
  piiDetection: {
    precision: number;
    recall: number;
    falsePositives: number;
    falseNegatives: number;
  };
  
  duplicateDetection: {
    precision: number;
    recall: number;
    falseMergeRate: number;
    missedDuplicateRate: number;
  };
  
  performance: {
    meanLatency: number;
    p95Latency: number;
    throughput: number;
    availability: number;
  };
  
  knownFailures: Array<{ incidentId: string; reason: string; expectedType: IncidentType; actualType: IncidentType }>;
}
```

### Success Criteria

**Minimum** (acceptable for hackathon):
- Classification accuracy > 75%
- Severity accuracy > 70%
- IOC extraction F1 > 0.70
- PII detection precision > 0.80

**Strong**:
- Classification accuracy > 85%
- Severity accuracy > 80%
- IOC extraction F1 > 0.80
- PII detection precision > 0.90
- Duplicate detection precision > 0.95

---

## Core Data Contract

The system uses a centralized, typed data contract for incident analysis.

### IncidentAnalysis Schema

```typescript
interface TechnicalIndicator {
  type: IndicatorType;
  value: string;
  context: string;
  confidence?: number;
  isMalicious?: boolean;
}

interface PiiDetection {
  type: PiiType;
  context: string;
  confidence: number;
  redactedAs: string;
}

interface RelatedIncident {
  incidentId: string;
  similarity: number;        // 0–1 scale
  reason: string;            // "Same domain", "Similar phishing pattern", etc.
}

interface IncidentAnalysis {
  // Identifiers
  incidentId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Raw input
  originalReport: string;
  
  // Classification
  incidentType: IncidentType;
  typeConfidence: number;    // 0–100%
  
  // Severity
  severity: IncidentSeverity;
  severityScore: number;     // 0–100
  severityReasons: string[]; // Bulleted reasons
  
  // Summary
  summary: string;           // Human-readable narrative (2–3 sentences)
  
  // Technical indicators
  technicalIndicators: TechnicalIndicator[];
  
  // PII
  piiDetections: PiiDetection[];
  sanitizedReport: string;
  
  // Correlation
  relatedIncidents: RelatedIncident[];
  clusterId?: string;
  
  // Routing
  recommendedRoute: RoutingDestination;
  routingReasoning: string[];
  
  // Recommended action
  recommendedAction: string;
  
  // Status
  status: "NEW" | "TRIAGED" | "INVESTIGATING" | "ESCALATED" | "RESOLVED" | "FALSE_POSITIVE";
  statusHistory: Array<{ status: string; timestamp: Date; analyst?: string }>;
  
  // Analyst notes
  notes?: string;
}
```

This contract is validated with Zod at all API boundaries.

---

## API Design

### POST /api/incidents/analyze

**Request**:
```json
{
  "report": "Raw incident report text"
}
```

**Response** (200):
```json
{
  "incident": {
    "incidentId": "INC-0001",
    "incidentType": "PHISHING",
    "typeConfidence": 0.94,
    "severity": "HIGH",
    "severityScore": 68,
    "severityReasons": [
      "Credentials were submitted to a suspected fraudulent domain",
      "Potential account takeover is active",
      "Payroll system is involved"
    ],
    "summary": "A user submitted credentials to a fraudulent payroll portal after receiving a phishing email.",
    "technicalIndicators": [
      { "type": "DOMAIN", "value": "payroll-login-secure.com", "context": "Fraudulent destination", "isMalicious": true }
    ],
    "piiDetections": [
      { "type": "PERSON_NAME", "context": "User mentioned by name", "redactedAs": "[PERSON]" }
    ],
    "sanitizedReport": "...",
    "recommendedRoute": "IDENTITY_SECURITY",
    "recommendedAction": "Reset user credentials immediately and investigate other accounts with same infrastructure.",
    "status": "NEW",
    "createdAt": "2026-09-07T10:30:00Z"
  }
}
```

**Response** (400):
```json
{
  "error": "Report cannot be empty"
}
```

**Response** (500):
```json
{
  "error": "Analysis service unavailable. Please try again."
}
```

### GET /api/incidents

**Query Parameters**:
- `page`: Integer, default 1
- `limit`: Integer, default 20
- `severity`: CRITICAL | HIGH | MEDIUM | LOW (optional)
- `type`: IncidentType (optional)
- `status`: NEW | TRIAGED | INVESTIGATING | RESOLVED | FALSE_POSITIVE (optional)
- `route`: RoutingDestination (optional)
- `search`: String (searches summary, IOC, ID) (optional)

**Response** (200):
```json
{
  "incidents": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### GET /api/incidents/:id

**Response** (200):
```json
{
  "incident": { ... }
}
```

### PATCH /api/incidents/:id

**Request**:
```json
{
  "status": "TRIAGED",
  "notes": "Forwarded to identity team"
}
```

**Response** (200):
```json
{
  "incident": { ... }
}
```

### GET /api/clusters

**Response** (200):
```json
{
  "clusters": [
    {
      "id": "CLUSTER-001",
      "name": "Payroll Phishing Campaign",
      "incidentCount": 12,
      "incidentType": "PHISHING",
      "highestSeverity": "HIGH",
      "commonIndicators": [...],
      "severityDistribution": { "CRITICAL": 0, "HIGH": 8, "MEDIUM": 4, "LOW": 0 },
      "createdAt": "2026-09-07T08:00:00Z"
    }
  ]
}
```

### GET /api/clusters/:id

**Response** (200):
```json
{
  "cluster": {
    "id": "CLUSTER-001",
    "incidentIds": ["INC-0001", "INC-0002", ...],
    "commonIndicators": [...],
    "timelineStart": "2026-09-07T08:00:00Z",
    "timelineEnd": "2026-09-07T15:30:00Z",
    "affectedOrganizations": ["Organization A", "Organization B"],
    ...
  }
}
```

### GET /api/evaluation

**Query Parameters**:
- `datasetId`: String (optional, for comparing multiple runs)

**Response** (200):
```json
{
  "result": {
    "runDate": "2026-09-10T14:00:00Z",
    "classification": { ... },
    "severity": { ... },
    "iocExtraction": { ... },
    "piiDetection": { ... },
    "duplicateDetection": { ... },
    "performance": { ... },
    "knownFailures": [
      { "incidentId": "INC-0042", "reason": "Ambiguous report", "expectedType": "MALWARE", "actualType": "OTHER" }
    ]
  }
}
```

---

## Database Schema

Incident data is stored in Supabase (PostgreSQL).

### Tables

#### incidents
```sql
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number VARCHAR(20) UNIQUE,      -- INC-0001, INC-0002, etc.
  raw_report TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'NEW',        -- NEW, TRIAGED, INVESTIGATING, RESOLVED, FALSE_POSITIVE
  analyst_notes TEXT,
  
  CONSTRAINT status_valid CHECK (status IN ('NEW', 'TRIAGED', 'INVESTIGATING', 'ESCALATED', 'RESOLVED', 'FALSE_POSITIVE'))
);
```

#### analyses
```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  incident_type VARCHAR(50) NOT NULL,
  type_confidence NUMERIC(3,2),             -- 0.00–1.00
  severity VARCHAR(20) NOT NULL,
  severity_score NUMERIC(3,0),              -- 0–100
  severity_reasons TEXT[],
  summary TEXT,
  recommended_route VARCHAR(100),
  routing_reasoning TEXT[],
  recommended_action TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT severity_valid CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  CONSTRAINT incident_type_valid CHECK (incident_type IN ('PHISHING', 'MALWARE', 'RANSOMWARE', ...))
);
```

#### technical_indicators
```sql
CREATE TABLE technical_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  indicator_type VARCHAR(50) NOT NULL,
  value TEXT NOT NULL,
  context TEXT,
  confidence NUMERIC(3,2),
  is_malicious BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT indicator_type_valid CHECK (indicator_type IN ('DOMAIN', 'URL', 'IPV4', ...))
);
```

#### pii_detections
```sql
CREATE TABLE pii_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  pii_type VARCHAR(50) NOT NULL,
  context TEXT,
  confidence NUMERIC(3,2),
  redacted_as VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT pii_type_valid CHECK (pii_type IN ('PERSON_NAME', 'PHONE_NUMBER', 'EMAIL_ADDRESS', ...))
);
```

#### sanitized_reports
```sql
CREATE TABLE sanitized_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### clusters
```sql
CREATE TABLE clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_number VARCHAR(20) UNIQUE,       -- CLUSTER-001, etc.
  cluster_name TEXT,
  primary_incident_id UUID REFERENCES incidents(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### incident_clusters
```sql
CREATE TABLE incident_clusters (
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE,
  cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
  PRIMARY KEY (incident_id, cluster_id)
);
```

---

## Security Requirements

This is a cybersecurity product. Security is non-negotiable.

### API Security
- **Authentication**: Future consideration (not required for hackathon MVP)
- **Secrets Management**: Gemini API key and Supabase credentials in `.env.local`, never in code
- **Input Validation**: All API inputs validated with Zod; reject oversized/malformed requests
- **Output Validation**: AI-generated outputs validated before storage/display; treat as untrusted

### Data Security
- **Logs**: Never log raw incident reports; only log anonymized metadata
- **PII Separation**: Original reports stored separately from sanitized versions
- **Database**: Supabase uses encryption at rest; credentials protected
- **Version Control**: `.env.local` and secrets in `.gitignore`

### Code Security
- **XSS Prevention**: Sanitize displayed content; use React's built-in XSS protection
- **SQL Injection**: Use Supabase client's parameterized queries (automatic)
- **Command Injection**: Never execute system commands based on user input
- **Dependency Management**: Regularly update npm packages; audit for vulnerabilities

### Compliance
- **Data Retention**: Define retention policy (delete incidents after X days)
- **Audit Logging**: Log who accessed what incident and when (future enhancement)
- **PII Handling**: Comply with data protection regulations (GDPR, local laws)

---

## User Experience Principles

The UI is designed for **analysts**, not marketing.

### Navigation & Layout
- **Consistent header**: Logo, navigation menu, user info
- **Main sidebar**: Dashboard, Incidents, Clusters, Evaluation
- **Responsive**: Mobile, tablet, desktop
- **Dark mode option**: Reduce eye strain for 24/7 analysts

### Color Scheme
```
Severity Indicators:
  CRITICAL: #DC2626 (red)
  HIGH: #EA580C (orange)
  MEDIUM: #FBBF24 (yellow)
  LOW: #10B981 (green)

Text:
  Primary: #1F2937 (dark gray)
  Secondary: #6B7280 (light gray)
  
Backgrounds:
  Light: #FFFFFF (white)
  Dark: #111827 (near-black, for dark mode)
```

### Typography
- **Headers**: Sans-serif (Inter, system font)
- **Body**: 14–16px, line-height 1.5
- **Monospace**: For technical indicators, IOCs, code

### Icons
- Use Lucide React icons consistently
- **Severity icons**: Alert triangle (HIGH), alert circle (CRITICAL), info circle (LOW)
- **Status icons**: Clock (NEW), checkmark (TRIAGED), gear (INVESTIGATING), lock (RESOLVED)

### Tables & Lists
- **Minimal design**: Rows, no boxes
- **Sortable columns**: Click to sort
- **Hover effects**: Highlight row on hover
- **Copy-to-clipboard**: Icons for IOCs, domains, etc.

### Errors & Feedback
- **Error messages**: Clear, actionable, no technical jargon
- **Success messages**: Confirm action (status changed, incident submitted)
- **Loading indicators**: Spinner with progress message
- **Validation feedback**: Inline errors on forms

### Performance
- **Page load**: < 2 seconds
- **Search/filter**: < 500ms response
- **Pagination**: Load 20–50 incidents per page
- **No unnecessary animations**: Keep it fast

---

## Testing Strategy

### Unit Tests
- Severity scoring logic
- IOC extraction (regex validation)
- PII detection patterns
- Classification confidence calculations
- Similarity calculations

### Integration Tests
- End-to-end: Submit report → Analyze → Persist → Retrieve
- API validation: Request validation, output validation
- Database: CRUD operations, status transitions
- Clustering: Duplicate detection, similarity scoring

### Manual Tests (QA)
- **Normal case**: Submit legitimate phishing report, verify all fields populated correctly
- **Edge cases**: Very short report, very long report, typos, mixed language
- **Security**: XSS attempts, oversized input, malformed JSON
- **Performance**: 100 concurrent submissions, measure latency

### Adversarial Tests
- Reports with no technical indicators
- Reports where PII looks like IOC (e.g., "admin@company.com")
- Ambiguous reports that could be multiple types
- Identical reports submitted 10 times (duplicate detection)
- Reports with fabricated indicators (AI hallucination check)

---

## Project Scope

### In Scope
- Incident submission and analysis
- Classification, severity, IOC extraction, PII redaction
- Incident queue and prioritization
- Incident detail page and status tracking
- Correlation and clustering
- Dashboard with metrics
- Evaluation against synthetic dataset
- API with input/output validation
- Security (API keys protected, input validated)

### Out of Scope (Future Phases)
- User authentication and multi-tenancy
- Advanced AI (LLM fine-tuning, custom models)
- Real-time threat feeds
- Automated incident response
- Machine learning model training
- Mobile app
- SIEM integration
- Blockchain or advanced infrastructure
- Massive scale (1M+ incidents)
- Microservice architecture (start with monolith)

---

## Acceptance Criteria (Definition of Done)

A feature is "done" when:

1. ✅ Implemented and integrated
2. ✅ Inputs are validated
3. ✅ Errors are handled gracefully
4. ✅ The normal case works end-to-end
5. ✅ Edge cases are tested
6. ✅ Existing functionality still works
7. ✅ TypeScript strict mode: zero errors
8. ✅ Code is reviewed and approved
9. ✅ Documentation is up to date
10. ✅ Merged into appropriate branch

## Project Completion Criteria

Sentria is **ready for submission** when:

- ✅ A messy incident report can be submitted
- ✅ System classifies it correctly (confidence > 70%)
- ✅ System assigns severity with explanation
- ✅ System extracts technical indicators
- ✅ System detects and sanitizes PII
- ✅ System generates summary and recommended action
- ✅ System detects related/duplicate reports
- ✅ System assigns cluster ID
- ✅ System routes to correct team with reasoning
- ✅ System persists incident with unique ID
- ✅ Incident appears in prioritized queue (highest risk first)
- ✅ Incident detail page shows all analysis fields
- ✅ Dashboard shows operational metrics (all real, not fabricated)
- ✅ Clusters are visible and queryable
- ✅ Evaluation metrics are computed from actual test run
- ✅ System handles adversarial inputs (typos, PII, ambiguity)
- ✅ All code is type-safe (TypeScript strict mode)
- ✅ All APIs validate input/output with Zod
- ✅ Security: Gemini API keys and Supabase credentials protected in env
- ✅ Performance: Latency < 10 seconds per report
- ✅ Team can defend every design decision before technical judges

---

## Development Phases

See [IMPLEMENTATION_ROADMAP.md](#) for detailed phase breakdown and timeline.

---

## Assumptions & Dependencies

### Assumptions
- Gemini API is available and performant
- Supabase is accessible and reliable
- Next.js/TypeScript ecosystem is stable
- Team has access to development tools (VS Code, npm, git)
- Synthetic dataset can be generated in time

### Dependencies
- **External APIs**: Gemini (Google), Supabase (PostgreSQL)
- **npm Packages**: Zod, shadcn/ui, Tailwind, Next.js, Lucide, React
- **Platform**: Windows/macOS/Linux with Node.js 18+

---

## Success Metrics

### For the Hackathon Demo
- ✅ System works end-to-end (submit report → get analysis → see in queue)
- ✅ Classification accuracy > 75% on test dataset
- ✅ Severity accuracy > 70%
- ✅ IOC extraction F1 > 0.70
- ✅ Duplicate detection F1 > 0.80
- ✅ All metrics computed from actual test run (not fabricated)
- ✅ Team presents clear demo with 4 key scenarios
- ✅ Team explains architecture decisions
- ✅ System handles diverse, messy input gracefully

### For Production Readiness (Post-Hackathon)
- ✅ Classification accuracy > 90%
- ✅ Severity accuracy > 85%
- ✅ IOC extraction F1 > 0.90
- ✅ PII detection precision > 0.95
- ✅ Duplicate detection precision > 0.98
- ✅ Mean latency < 5 seconds
- ✅ 99.9% uptime
- ✅ Deployment to production environment

---

## Document History

| Date | Version | Author | Change |
|------|---------|--------|--------|
| 2026-09-07 | 1.0 | Team | Initial PRD based on hackathon brief |

---

**This PRD is the authoritative source of truth for Sentria development. All architecture, design, and implementation decisions must align with this document.**
