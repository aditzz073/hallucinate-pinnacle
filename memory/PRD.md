# Pinnacle.AI - PRD

## Problem Statement
Build a production-grade SaaS platform ("Pinnacle.AI") for AI Engine Optimization (AEO/GEO). All 10 phases complete + comprehensive UI/UX redesign + GEO integration.

## Architecture
- **Frontend**: React 18 + TailwindCSS + React Router + Recharts + Inter font
- **Backend**: FastAPI (Python 3.11) + MongoDB (Motor)
- **Auth**: JWT (PyJWT + bcrypt)
- **HTML Parsing**: BeautifulSoup4 + lxml + httpx + curl_cffi + cloudscraper
- **Design System**: Vision Pro-inspired glassmorphism, dark-first, floating navbar

## What's Been Implemented

### Phases 0-9 (Backend - Complete)
- Auth, AEO engine, AI citation testing, monitoring, reports
- Advanced audit with explainability, content compiler, strategy simulator
- Production hardening (rate limiting, security headers)
- Enterprise features (sensitivity modes, competitor comparison, executive summary)

### GEO Integration (2026-02-12)
- **Generative Readiness Score (0-100)**: Measures how extractable content is for AI answers
  - Definition blocks, summary sections, FAQ presence
  - Bullet/numbered lists, heading hierarchy, fluff density
- **Summarization Resilience (0-100)**: Measures how well content survives AI compression
  - Key definition position, front-loading, idea repetition
  - Filler ratio, summary blocks presence
- **Brand Retention Probability (0-100)**: Measures if brand survives in AI output
  - Brand frequency, positioning near definitions
  - Attribution patterns ("According to Brand X...")
  - Organization/author schema presence
- **GEO Score Formula**: 40% Readiness + 30% Resilience + 30% Brand Retention
- **GEO Insights**: Strengths, weaknesses (with severity), improvement suggestions
- **All scoring is DETERMINISTIC** - no external AI/LLM dependencies

### UI/UX Redesign (2026-02-12)
- **Landing Page**: Hero with animated gradient blobs, thin typography, dual CTAs
- **Floating Pill Navbar**: Compact glassmorphism navbar with dropdown menus
- **Glass Card Design**: All cards use frosted glass effect with hover animations
- **Auth Pages**: Centered glass card with blob backgrounds
- **Dashboard**: 4-column metric grid, health badges, recent activity
- **AI Tests Page**: Citation + GEO scores side-by-side, 3 GEO factor cards, expandable insights
- **Color Palette**: Pure black background, brand blue (#3A9BFF), brand teal (#60D5C8)

### Frontend Unification (2026-02-13)
- **Brand Name Fix**: "Pinnacle.ai" (no space) standardized everywhere
- **Enhanced Navbar**: Increased height/padding, Profile button added
- **Global Footer**: Brand + navigation links + copyright on all pages
- **Profile Page**: Account info, usage stats, subscription, security sections
- **Page Consistency**: Unified card styles, spacing, typography system
- **Removed "Phase X"**: Clean headings across all enterprise pages
- **Background**: Unified deep dark gradient (`#0a0a0f`)

## Test Coverage
- Backend: 100% (48/48 tests - 31 core + 17 GEO tests)
- Frontend: 100% (all flows verified including GEO display)
- Test credentials: test@pinnacle.ai / Test123!
- Test reports: /app/test_reports/iteration_6.json

## Key Files
### GEO Modules
- `backend/modules/aiTestingEngine/geo_service.py` - Main orchestrator
- `backend/modules/aiTestingEngine/geo_generative_readiness.py` - Readiness calculator
- `backend/modules/aiTestingEngine/geo_summarization_resilience.py` - Resilience calculator
- `backend/modules/aiTestingEngine/geo_brand_retention.py` - Brand retention calculator

### Core Modules
- `backend/modules/aeoEngine/` - AEO audit engine
- `backend/modules/aiTestingEngine/` - AI citation testing
- `backend/modules/monitoring/` - Page monitoring
- `backend/modules/reports/` - Reporting/analytics

## Known Limitations
- Sites with aggressive Cloudflare/bot protection cannot be analyzed
- The HTML fetcher uses curl_cffi + cloudscraper + httpx fallback chain

## API Response Format (AI Test)
```json
{
  "citation_probability": 61,
  "geo_score": 67,
  "generative_readiness": 68,
  "summarization_resilience": 80,
  "brand_retention_probability": 52,
  "detected_brand": "Wikipedia",
  "likely_position": "Top 10",
  "breakdown": {...},
  "geo_insights": {
    "strengths": [...],
    "weaknesses": [...],
    "improvement_suggestions": [...]
  }
}
```

## Next Tasks
- Awaiting further requirements from user
