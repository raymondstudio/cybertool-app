# CAMPUS SECURED

**Cybersecurity Incident Triage Platform**

Transform messy incident reports into structured, actionable intelligence.

## Project Overview

CAMPUS SECURED is an AI-assisted incident triage platform designed for security teams that receive large volumes of poorly formatted reports. The system automatically classifies incidents, calculates severity, extracts technical indicators, redacts PII, detects duplicates, and routes incidents to the appropriate team.

**Challenge**: D1 — Sorting Incident Reports Nobody Has Time to Read (Government & Public Sector Track)  
**Hackathon Deadline**: September 18, 2026  
**Status**: ACTIVE DEVELOPMENT (Phase 0–1)

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Gemini API key (Google)
- Supabase project

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
src/
├── app/                            # Next.js App Router pages
├── components/                     # Reusable React components
├── lib/                            # Business logic & utilities
├── types/                          # TypeScript types & Zod schemas
└── config/                         # Configuration
```

## Development Phases

See [docs/PRD.md](./docs/PRD.md) for complete product specification.

**Phase 0**: ✅ PRD  
**Phase 1**: 🟡 Scaffolding (In Progress)  
**Phase 2**: Core Analysis Engine  
**Phase 3**: Persistence Layer  
**Phases 4–8**: UI, Features, Evaluation  

## Key Technologies

- **Frontend**: Next.js 14+, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js App Router
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Generative AI (Gemini)
- **Validation**: Zod

## Documentation

- **[Product Requirements (PRD)](./docs/PRD.md)** — Complete specification
- **[Implementation Roadmap](./docs/PRD.md#development-phases)** — Phase details

## Getting Started (Development)

```bash
# Install dependencies
npm install

# Create .env.local with your API keys
cp .env.example .env.local

# Run development server
npm run dev
```

## Building & Deployment

```bash
# Development
npm run dev

# Production build
npm run build

# Production start
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

## Git Workflow

- `main` — Production code
- `develop` — Integration
- `feature/*` — Feature branches

Commits must be meaningful and focused. All work goes through PRs.

## Team

- **Technical Lead**: Architecture, analysis engine, backend
- **Full-Stack Developer**: Frontend, UI, API integration
- **PM/QA**: Product, dataset, testing

## Security

- Never commit secrets (use `.env.local`)
- Validate all inputs with Zod
- Sanitize displayed content
- Use parameterized queries

## Acceptance Criteria

Project is submission-ready when:
- ✅ Incident analysis pipeline works end-to-end
- ✅ Classification accuracy > 75%, Severity accuracy > 70%
- ✅ Incidents prioritized by risk (not chronological)
- ✅ Dashboard shows real metrics
- ✅ All code type-safe, APIs validated
- ✅ Team can defend all design decisions

---

**Status**: Development in progress. PRD complete. Phase 1 scaffolding active.
