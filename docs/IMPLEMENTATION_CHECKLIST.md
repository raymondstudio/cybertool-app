# Sentria — Implementation Checklist

**Project Status**: Phase 0–1 (PRD + Scaffolding)  
**Deadline**: September 18, 2026 (11 days)  
**Last Updated**: September 7, 2026

---

## PHASE 0: Project Discovery & PRD (Days 1–2) ✅ COMPLETE

### Deliverables
- [x] `docs/PRD.md` — Comprehensive 15-section product requirements document
  - [x] Executive summary and problem statement
  - [x] Product vision and user personas
  - [x] User stories (Epic 1–4)
  - [x] Incident taxonomy (enum-based)
  - [x] Severity model (0–100 rule-based scoring)
  - [x] Technical indicator types (IOCs)
  - [x] PII detection and redaction rules
  - [x] Incident correlation and clustering model
  - [x] Routing logic and destinations
  - [x] Queue prioritization model
  - [x] Dashboard metrics
  - [x] Evaluation methodology
  - [x] Database schema
  - [x] API contracts (Zod schemas)
  - [x] Security requirements
  - [x] Testing strategy
  - [x] Development phases and timeline

### Sign-Off
- [ ] Technical Lead reviews PRD
- [ ] Full-Stack Developer reviews PRD
- [ ] PM confirms requirements
- [ ] Team consensus on design decisions

---

## PHASE 1: Project Scaffolding & Foundation (Days 2–3) 🟡 IN PROGRESS

### Deliverables

#### Infrastructure
- [x] Initialize Next.js 14+ with TypeScript
  - [x] App Router structure
  - [x] src/ folder organization
  - [x] Strict TypeScript configuration
  - [x] Tailwind CSS configured
  - [x] ESLint configured
  - [x] Git initialized

- [x] Install all dependencies
  - [x] Zod for validation
  - [x] @google/generative-ai for Gemini API
  - [x] @supabase/supabase-js for database
  - [x] shadcn-ui components (note: package deprecated, use CLI instead)
  - [x] lucide-react for icons
  - [x] Utility libraries (clsx, tailwind-merge, class-variance-authority)

#### Type System
- [x] Create `src/types/incident.ts`
  - [x] Enums: IncidentType, IncidentSeverity, IndicatorType, PiiType, RoutingDestination, IncidentStatus
  - [x] Zod schemas for all types
  - [x] Core IncidentAnalysis schema (comprehensive)
  - [x] Supporting schemas (TechnicalIndicator, PiiDetection, RelatedIncident, etc.)
  - [x] Request/response schemas for APIs

#### Utilities & Configuration
- [x] Create `src/lib/errors.ts`
  - [x] Error codes enum
  - [x] AppError class
  - [x] Error response formatting
  - [x] Error logging utilities

- [x] Create `.env.example`
  - [x] Gemini API configuration
  - [x] Supabase configuration
  - [x] Application settings

- [x] Update `README.md`
  - [x] Project overview
  - [x] Quick start guide
  - [x] Technology stack
  - [x] Development phases
  - [x] Acceptance criteria

#### API Routes
- [x] Create `src/app/api/incidents/analyze/route.ts`
  - [x] Request validation with Zod
  - [x] Response validation with Zod
  - [x] Error handling
  - [x] Mock analysis response for testing structure
  - [x] Proper HTTP status codes

### Todos (Remaining Phase 1 Tasks)
- [x] Verify `npm install` completes successfully
- [x] Run `npm run build` — verify zero TypeScript errors
- [ ] Create placeholder pages
  - [ ] `/dashboard` (page.tsx)
  - [ ] `/incidents` (incidents/page.tsx)
  - [ ] `/incidents/[id]` (incidents/[id]/page.tsx)
  - [ ] `/clusters` (clusters/page.tsx)
  - [ ] `/evaluation` (evaluation/page.tsx)
- [ ] Create base layouts
  - [ ] Root layout with navigation
  - [ ] Sidebar/nav component
  - [ ] Header component
  - [ ] Footer component
- [ ] Create UI component templates
  - [ ] Dashboard layout
  - [ ] Incident queue table
  - [ ] Detail page layout
  - [ ] Cluster view
  - [ ] Evaluation metrics display
- [ ] Set up git workflow
  - [ ] Create develop branch
  - [ ] Create feature branch for Phase 2
  - [ ] Clean commit history
- [ ] Create `.env.local` from `.env.example` (locally only)
- [x] Verify dev server runs (`npm run dev`)
- [x] Test API endpoint (`POST /api/incidents/analyze` returns mock response)

### Gate Criteria (Phase 1 Complete)
- ✅ Next.js app scaffolded with TypeScript
- ✅ All dependencies installed
- ✅ Core types and schemas defined (Zod-validated)
- ✅ Error handling in place
- ✅ API route structure ready
- ✅ Build passes with zero TypeScript errors
- ✅ Dev server runs without errors
- ⏳ All placeholder pages created
- ⏳ Git workflow clean

---

## PHASE 2: Core Analysis Engine (Days 3–5)

### Classification (Gemini API)
- [ ] Create `src/lib/ai/providers/gemini.ts`
- [ ] Create `src/lib/ai/prompts/classification.ts`
- [ ] Implement classification with confidence scoring
- [ ] Validate output against IncidentType enum
- [ ] Add tests for known classifications

### Severity Scoring (Deterministic)
- [ ] Create `src/lib/analysis/severity.ts`
- [ ] Implement scoring factors (credential compromise, active status, system criticality, etc.)
- [ ] Map scores to severity levels (0–100 → LOW/MEDIUM/HIGH/CRITICAL)
- [ ] Generate `severityReasons` array
- [ ] Add tests for all levels

### IOC Extraction (Hybrid)
- [ ] Create `src/lib/analysis/indicators.ts`
- [ ] Implement regex-based extraction (URLs, domains, IPs, emails, hashes, phones)
- [ ] Create `src/lib/ai/prompts/indicators.ts` (LLM fallback)
- [ ] Context preservation for each indicator
- [ ] Test against 50+ mixed reports

### PII Detection & Redaction (Hybrid)
- [ ] Create `src/lib/analysis/pii.ts`
- [ ] Implement rule-based detection
- [ ] Create `src/lib/ai/prompts/pii.ts` (LLM context-aware)
- [ ] Implement redaction logic
- [ ] Test 30+ reports with mixed PII + IOC

### Summarization (Gemini)
- [ ] Create `src/lib/ai/prompts/summarization.ts`
- [ ] Generate summaries with length/clarity constraints
- [ ] Test for hallucination/fabrication

### Routing (Deterministic)
- [ ] Create `src/lib/analysis/routing.ts`
- [ ] Map IncidentType + severity → destination
- [ ] Make routing rules explicit and testable

### Recommended Action (Hybrid)
- [ ] Create `src/lib/ai/prompts/recommendation.ts`
- [ ] Generate actionable next steps
- [ ] Test against known types

### Integration
- [ ] Complete `/api/incidents/analyze` endpoint
- [ ] Call all components sequentially
- [ ] Validate final IncidentAnalysis with Zod
- [ ] Handle errors gracefully
- [ ] Latency < 10 seconds target

### Testing
- [ ] Unit tests for severity scoring
- [ ] Unit tests for IOC extraction
- [ ] Unit tests for PII detection
- [ ] Integration test: End-to-end analysis
- [ ] Adversarial testing (typos, edge cases)

### Gate Criteria (Phase 2 Complete)
- [ ] Submit messy phishing report, receive structured IncidentAnalysis
- [ ] Classification confidence > 0.7 for known types
- [ ] Severity scoring is deterministic and explainable
- [ ] IOC extraction catches 95%+ of indicators
- [ ] PII detection works without over-redaction
- [ ] API endpoint returns valid IncidentAnalysis JSON
- [ ] No hardcoded responses; all outputs computed
- [ ] Latency < 10s per request

---

## PHASE 3: Persistence Layer (Days 5–6)

- [ ] Set up Supabase database connection
- [ ] Create database schema (incidents, analyses, indicators, pii_detections, sanitized_reports, clusters, incident_clusters)
- [ ] Implement Supabase client integration
- [ ] Create `src/lib/db/incidents.ts` (query/insert functions)
- [ ] Modify `/api/incidents/analyze` to persist results
- [ ] Create `/api/incidents` (GET list, POST new)
- [ ] Create `/api/incidents/:id` (GET detail, PATCH status)
- [ ] Add pagination, filtering
- [ ] Test full workflow: Submit → Analyze → Persist → Retrieve

### Gate Criteria
- [ ] All analysis data persists to Supabase
- [ ] Incidents can be created, read, updated
- [ ] Status transitions work
- [ ] Query performance acceptable (< 500ms)
- [ ] Original and sanitized reports stored separately

---

## PHASE 4: Incident Queue UI (Days 6–7)

- [ ] Create `src/app/incidents/page.tsx`
- [ ] Build incident table with: ID, Type, Severity, Risk Score, Summary, Timestamp, Status, Route
- [ ] Implement prioritization: CRITICAL/HIGH first, then by risk score
- [ ] Add filters (severity, type, status, route, date range)
- [ ] Add search (by ID, IOC, summary text)
- [ ] Implement pagination
- [ ] Color-code severity levels
- [ ] Make responsive (mobile-friendly)
- [ ] Test with 50+ incidents

### Gate Criteria
- [ ] Critical incidents at top
- [ ] Filters work correctly
- [ ] Search finds incidents by content
- [ ] Page load < 2s
- [ ] Mobile responsive
- [ ] Clicking incident navigates to detail

---

## PHASE 5: Correlation & Clustering (Days 7–8)

- [ ] Create `src/lib/analysis/similarity.ts` (multi-factor similarity)
- [ ] Implement duplicate detection (exact and near)
- [ ] Create clustering algorithm
- [ ] Create `/api/clusters` and `/api/clusters/:id` endpoints
- [ ] Create `src/app/clusters/page.tsx` and `src/app/clusters/[id]/page.tsx`
- [ ] Display cluster details (count, type, IOCs, severity distribution, timeline)

### Gate Criteria
- [ ] Exact duplicates detected with 100% precision
- [ ] Near-duplicates flagged with similarity score
- [ ] False merge rate < 5%
- [ ] Clusters queryable from incident detail

---

## PHASE 6: Incident Detail Page (Days 8–9)

- [ ] Create `src/app/incidents/[id]/page.tsx`
- [ ] Display all analysis fields:
  - [ ] Classification (type, confidence)
  - [ ] Severity (level, score, reasons)
  - [ ] Summary
  - [ ] Technical indicators
  - [ ] PII detected
  - [ ] Original vs. sanitized reports (side-by-side)
  - [ ] Related incidents
  - [ ] Cluster
  - [ ] Routing
  - [ ] Recommended action
  - [ ] Status
  - [ ] Timeline
- [ ] Allow status changes
- [ ] Make responsive
- [ ] Copy-to-clipboard for IOCs

### Gate Criteria
- [ ] All fields visible
- [ ] Original and sanitized clearly distinguished
- [ ] Page load < 2s
- [ ] Analyst can understand incident from page

---

## PHASE 7: Dashboard (Days 9–10)

- [ ] Create dashboard page (`src/app/page.tsx`)
- [ ] Display metrics cards:
  - [ ] Total reports
  - [ ] CRITICAL count
  - [ ] HIGH count
  - [ ] Awaiting triage
  - [ ] Active clusters
  - [ ] PII detections
  - [ ] Avg latency
- [ ] Display charts (type distribution, severity over time)
- [ ] Display priority queue preview (top 10)
- [ ] Ensure all metrics are real (from DB, not hardcoded)

### Gate Criteria
- [ ] All metrics computed from actual data
- [ ] Critical incidents prominently displayed
- [ ] Dashboard answers "What needs attention?"
- [ ] Page load < 2s

---

## PHASE 8: Dataset & Evaluation (Days 10–11)

### Dataset
- [ ] Create synthetic dataset: 500–1,000 incident reports
- [ ] Include:
  - [ ] All incident types
  - [ ] All severity levels
  - [ ] Short/long reports
  - [ ] Typos, grammar issues
  - [ ] Mixed English/Pidgin
  - [ ] Reports with IOCs, PII
  - [ ] Exact duplicates, near-duplicates
  - [ ] Ambiguous reports, false positives
  - [ ] Edge cases
- [ ] Create ground truth for each report
- [ ] Document generation methodology
- [ ] Create 80/20 train/test split

### Evaluation
- [ ] Create `src/lib/evaluation/metrics.ts`
- [ ] Implement metric calculations:
  - [ ] Classification (accuracy, precision, recall, F1, confusion matrix)
  - [ ] Severity (accuracy, macro F1, confusion matrix)
  - [ ] IOC extraction (precision, recall, F1 per type)
  - [ ] PII detection (precision, recall, false positives/negatives)
  - [ ] Duplicate detection (precision, recall, false merge rate)
  - [ ] Performance (latency, throughput)
- [ ] Create evaluation runner
- [ ] Create `/api/evaluation` endpoint
- [ ] Create `src/app/evaluation/page.tsx`
- [ ] Display metrics, confusion matrices, known failures
- [ ] Ensure all metrics are real (not fabricated)

### Gate Criteria
- [ ] Dataset has 500+ diverse reports
- [ ] Ground truth documented
- [ ] Evaluation runs without errors
- [ ] All metrics calculated correctly
- [ ] Known failure cases documented
- [ ] Evaluation reproducible
- [ ] No fabricated metrics

---

## PHASE 9: AI Enhancement (Optional, Days 11+)

- [ ] Advanced LLM classification
- [ ] Contextual reasoning
- [ ] Improved summarization
- [ ] Semantic embeddings
- [ ] Better clustering

---

## PHASE 10: Adversarial Testing (Days 11+)

- [ ] Very short reports
- [ ] Very long reports
- [ ] Typos, poor grammar
- [ ] Mixed languages
- [ ] No technical details
- [ ] Multiple incidents in one report
- [ ] PII resembling IOCs
- [ ] Misleading descriptions
- [ ] Malicious payloads (XSS, SQL injection)

---

## FINAL: Hackathon Demo Preparation (Day 11)

### Demo Scenarios
1. **Scenario 1**: Messy phishing report
   - [ ] Submit
   - [ ] Show classification, severity, IOC, PII sanitization, routing
2. **Scenario 2**: Duplicate detection
   - [ ] Submit variant report
   - [ ] Show cluster assignment
3. **Scenario 3**: Critical incident priority
   - [ ] Show critical at top of queue
   - [ ] Show dashboard highlights
   - [ ] Show detail page reasoning
4. **Scenario 4**: Evaluation metrics
   - [ ] Show evaluation run
   - [ ] Show metrics dashboard
   - [ ] Show known failures

### Deployment
- [ ] Production build
- [ ] Environment variables configured
- [ ] Database connectivity verified
- [ ] AI integration working
- [ ] Error handling tested
- [ ] Performance acceptable
- [ ] Run full demo against production deployment

---

## Daily Standup Template

**Date**: [DATE]  
**Team Members**: [NAMES]

### Technical Lead
- Yesterday: [WORK COMPLETED]
- Today: [PLANNED WORK]
- Blockers: [ANY BLOCKERS]

### Full-Stack Developer
- Yesterday: [WORK COMPLETED]
- Today: [PLANNED WORK]
- Blockers: [ANY BLOCKERS]

### PM/QA
- Yesterday: [WORK COMPLETED]
- Today: [PLANNED WORK]
- Blockers: [ANY BLOCKERS]

### Priority Items
1. [MOST URGENT TASK]
2. [NEXT PRIORITY]
3. [THIRD PRIORITY]

---

## Success Criteria (Project Complete)

- ✅ Raw incident report can be submitted
- ✅ System classifies it (confidence > 70%)
- ✅ System assigns severity with explanation
- ✅ System extracts IOCs
- ✅ System detects and sanitizes PII
- ✅ System generates summary and action
- ✅ System detects related/duplicate reports
- ✅ System assigns cluster
- ✅ System prioritizes queue by risk
- ✅ Incident detail page shows all analysis
- ✅ Dashboard shows real metrics
- ✅ Evaluation metrics are honest (not fabricated)
- ✅ All code type-safe, APIs validated
- ✅ Security: API keys protected
- ✅ Performance: < 10s latency
- ✅ Team can defend all decisions

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Gemini API quota exceeded | Implement caching, rate limiting, fallback to rule-based |
| Supabase setup delays | Use SQLite locally, migrate later |
| NLP accuracy low | Use simpler rule-based approach, add LLM later |
| Duplicate detection false merges | Manual review, high threshold, rigorous testing |
| Dataset generation delays | Prepare framework early, generate in parallel |
| Latency > 10s per report | Profile early, batch Gemini calls, cache |
| Team misalignment | Daily standups, PRD signed off, clear roles |

---

**Last Updated**: September 7, 2026, 4:35 PM  
**Next Checkpoint**: September 8, 2026 (Phase 1 complete, Phase 2 begins)
