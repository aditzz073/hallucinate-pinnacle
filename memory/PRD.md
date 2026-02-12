# AI Discoverability Copilot - PRD

## Problem Statement
Build a production-grade SaaS platform ("AI Discoverability Copilot") for AI Engine Optimization (AEO/GEO) that analyzes how webpages perform in AI-generated answers. 10 phases total.

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

## Core Requirements
- JWT authentication (register/login/protected routes)
- Modular backend with middleware (logging, auth)
- MongoDB collections: users, audits, ai_tests, monitored_pages, page_snapshots, page_change_logs
- Append-only snapshot architecture
- User-scoped queries
- Deterministic scoring (no randomness)
- No AI API calls

## What's Been Implemented

### Phase 0 - Architecture Setup (2026-02-12)
- Full project skeleton with modular structure
- FastAPI server with CORS, centralized error handling, logging middleware
- MongoDB connection with indexed collections (6 collections)
- JWT authentication: register, login, /me, route protection
- React frontend: Login/Register pages, Dashboard, Sidebar navigation
- Health endpoint, Docker reference files
- **Testing: 100% (14/14)**

### Phase 1 - Core AEO Engine (2026-02-12)
- Secure HTML fetcher (httpx, 10s timeout, 5MB limit, private IP rejection)
- HTML parser (BeautifulSoup4): title, meta, headings, links, images, JSON-LD, author, org signals
- Page type classifier (article/product/service/homepage/blog/generic)
- Structured signal builder (structure/trust/media/schema/technical)
- Deterministic scorer (weighted 0-100 scores)
- Recommendation engine (severity-prioritized with fix instructions)
- POST /api/audit, GET /api/audit, GET /api/audit/{id}

### Phase 2 - AI Citation Testing Engine (2026-02-12)
- Query tokenizer + intent detector (informational/comparison/transactional/definition/list)
- Content matcher (heading relevance, keyword overlap, FAQ, definition, summary detection)
- Extractability scorer
- Authority scorer
- Citation probability formula (weighted: intentMatch 25%, extractability 25%, authority 20%, schemaSupport 15%, contentDepth 15%)
- Position estimator (Top 3/5/10/Low)
- Why-not-cited gap analyzer + improvement suggestions
- POST /api/ai-test, GET /api/ai-test, GET /api/ai-test/{id}

### Phase 3 - Page Monitoring Engine (2026-02-12)
- Add/list/delete monitored pages
- Append-only snapshot generation (signal extraction per snapshot)
- Snapshot comparison with deterministic change detection
- Change log with impact classification (positive/negative/neutral)
- POST /api/monitor, GET /api/monitor, POST /api/monitor/{id}/refresh, GET /api/monitor/{id}/changes, DELETE /api/monitor/{id}

### Phase 4 - Reports & Analytics Dashboard (2026-02-12)
- Overview: aggregated stats, recent activity
- Trends: score history, weekly averages, breakdown radar, deltas
- Competitors: URL-vs-URL comparison (AEO score + citation probability)
- Recharts integration (LineChart, BarChart, RadarChart)
- GET /api/reports/overview, GET /api/reports/trends, GET /api/reports/competitors

### Frontend Pages (All Phases)
- Dashboard with real data + navigation to feature pages
- Audits page: form + result display + history
- AI Tests page: dual-input form + citation result + gaps/suggestions
- Monitoring page: add/refresh/delete monitors + change log viewer
- Reports page: 3-tab layout (Overview/Trends/Competitors) with charts

**Testing: 100% pass rate (35/35 tests across iteration 2)**

## Prioritized Backlog
- **P0**: Phases 5-9 (per user's phased delivery plan)
- **P1**: Real AI integration (currently deterministic/heuristic)
- **P2**: Rate limiting, email verification, production hardening

## Next Tasks
- Awaiting Phase 5 requirements from user
