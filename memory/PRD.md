# AI Discoverability Copilot - PRD

## Problem Statement
Build a production-grade SaaS platform ("AI Discoverability Copilot") for AI Engine Optimization (AEO/GEO) that analyzes how webpages perform in AI-generated answers. 10 phases total.

## Architecture
- **Frontend**: React 18 + TailwindCSS + React Router
- **Backend**: FastAPI (Python 3.11) + MongoDB (Motor)
- **Auth**: JWT (PyJWT + bcrypt)
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
- Health endpoint
- Docker support

## What's Been Implemented

### Phase 0 - Architecture Setup (2026-02-12)
- Full project skeleton with modular structure
- FastAPI server with CORS, centralized error handling, logging middleware
- MongoDB connection with indexed collections (6 collections)
- JWT authentication: register, login, /me, route protection
- React frontend: Login/Register pages (split layout), Dashboard, Sidebar navigation
- Health endpoint (/api/health)
- Docker reference files (Dockerfile.backend, Dockerfile.frontend, docker-compose.yml)
- **Testing: 100% pass rate (14/14 tests)**

## Prioritized Backlog
- **P0**: Phases 1-9 (per user's phased delivery plan)
- **P1**: AI integration (currently MOCKED)
- **P2**: Production hardening, rate limiting, email verification

## Next Tasks
- Awaiting Phase 1 requirements from user
