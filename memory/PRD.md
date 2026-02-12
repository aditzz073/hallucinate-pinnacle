# Pinnacle.AI - PRD

## Problem Statement
Build a production-grade SaaS platform ("Pinnacle.AI", renamed from "AI Discoverability Copilot") for AI Engine Optimization (AEO/GEO) that analyzes how webpages perform in AI-generated answers. 10 phases total.

## Architecture
- **Frontend**: React 18 + TailwindCSS + React Router + Recharts
- **Backend**: FastAPI (Python 3.11) + MongoDB (Motor)
- **Auth**: JWT (PyJWT + bcrypt)
- **HTML Parsing**: BeautifulSoup4 + lxml + httpx
- **Docker**: Reference files for containerized deployment

## User Personas
- SEO professionals optimizing for AI search
- Content marketers wanting AI discoverability
- Developers building AI-optimized content

## What's Been Implemented

### Phase 0 - Architecture Setup (2026-02-12)
- Project skeleton, FastAPI server, MongoDB, JWT auth, Docker

### Phase 1 - Core AEO Engine
- HTML fetch/parse, page classifier, signal builder, deterministic scorer, recommendations

### Phase 2 - AI Citation Testing Engine
- Query processing, content matching, extractability/authority scoring, citation probability formula

### Phase 3 - Page Monitoring Engine
- Append-only snapshots, deterministic change detection, impact classification

### Phase 4 - Reports & Analytics Dashboard
- Overview, trends, competitor comparison, Recharts charts

### Phase 5 - Advanced Audit + Explainability (2026-02-12)
- Per-category contributing factors, penalties, detected signals, evidence
- Historical intelligence from monitoring snapshots
- Audit integrity metadata (deterministic flag, scoring version, total signals)
- POST /api/audit/advanced

### Phase 6 - AI Content Compiler
- Semantic block classification (Definition, FAQ, Summary, Comparison, Authority, List)
- Semantic tree builder
- AI Compilation Readiness score (0-100)
- POST /api/compile

### Phase 7 - Strategy Simulation Engine
- Clone-and-simulate approach (no real page modification)
- 4 strategies: addFAQ, addSummary, addSchema, improveAuthority
- Original vs simulated probability comparison with delta
- POST /api/simulate-strategy

### Phase 8 - Production Hardening
- Rate limiting (per-IP 100/min + per-user 60/min)
- Security headers (X-Content-Type-Options, X-Frame-Options, XSS, Referrer-Policy, Permissions-Policy)
- Input validation middleware (URL sanitization, private IP blocking)
- Standardized error responses with timestamps

### Phase 9 - Enterprise Differentiation
- Behavior Sensitivity Toggle (authorityFocused/structureFocused/conversationalFocused modes)
- Competitor AI Comparison (POST /api/enterprise/compare with gap analysis)
- Executive Summary Generator (deterministic health assessment)
- POST /api/enterprise/sensitivity-test, POST /api/enterprise/compare, GET /api/enterprise/executive-summary

### Frontend Pages (All Phases)
- Dashboard, Audits, AI Tests, Monitoring, Reports
- Advanced Audit, Strategy Simulator, Competitor Intelligence, Executive Summary
- All branded as "Pinnacle.AI"

**Testing: 98% overall pass (iteration 3, 20/20 tests)**

## Prioritized Backlog
- **P0**: Phase 10 (if any) or user-requested features
- **P1**: Real AI integration (currently deterministic/heuristic)
- **P2**: Email notifications, team/workspace support

## Next Tasks
- Awaiting further requirements from user
