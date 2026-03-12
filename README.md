# Pinnacle.AI

**Pinnacle.ai** is a production-grade SaaS platform for **AI Engine Optimization (AEO) and Generative Engine Optimization (GEO)**. It analyses webpages against the signals that modern AI systems (ChatGPT, Perplexity, Google SGE, Claude, Gemini) use when deciding what content to surface in generated answers.

All scoring is **fully deterministic** — no external LLM calls are made during analysis.

---

## Features

### Core Analysis Modules
| Module | Description |
|---|---|
| **AEO Audit** | Full-page audit scoring Structure, Trust, Schema, Freshness, Media, and Technical signals |
| **AI Citation Testing** | Predicts citation probability for a specific query + URL pair |
| **GEO Scoring** | Measures Generative Readiness, Summarization Resilience, and Brand Retention |
| **Advanced Audit** | Deep per-signal explainability with contributing factors, penalties, and evidence |
| **AI Testing Lab** | Multi-engine readiness comparison across ChatGPT, Perplexity, Google SGE, Claude, and Gemini |
| **AI Content Compiler** | Extracts and structures page content for AI-optimised rewriting |
| **Strategy Simulator** | Simulates how targeted content changes would affect citation scores |
| **Page Monitoring** | Tracks pages over time and detects signal changes between snapshots |
| **Reports & Analytics** | Overview dashboard, score trends, and competitor comparison data |
| **Enterprise** | Competitor comparison (up to 5 URLs), custom sensitivity modes, executive summary |

### GEO Scoring (0–100 each)
- **Generative Readiness** — definition blocks, summary sections, FAQ presence, heading hierarchy, bullet/numbered lists, fluff density
- **Summarization Resilience** — key definition position, front-loading, idea repetition, filler ratio, summary blocks
- **Brand Retention Probability** — brand frequency, positioning near definitions, attribution patterns, Organization/Author schema

> GEO Score = 40% Readiness + 30% Resilience + 30% Brand Retention

### AI Testing Lab — Supported Engines
- **ChatGPT** — prioritises well-structured, comprehensive content from authoritative sources
- **Perplexity** — craves structured data with strong citations and up-to-date information
- **Google SGE** — rewards structured data, E-E-A-T signals, and freshness
- **Claude** — emphasises factual accuracy, citations, and clear logical structure
- **Gemini** — favours multimodal content, rich structured data, and Google ecosystem signals

### Production Hardening
- JWT authentication (PyJWT + bcrypt) with optional guest mode on key endpoints
- Per-IP and per-user rate limiting (token-bucket, in-memory)
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`
- Centralised error handling and structured request logging
- All DB queries scoped by `user_id`; append-only snapshot architecture

### HTML Fetching
A hybrid fetching pipeline is used to handle bot-protected and JavaScript-rendered pages:
1. Raw fetch via `curl_cffi` + `cloudscraper` + `httpx` fallback chain
2. Content sufficiency check (word count, heading count, paragraph count)
3. Automatic headless browser fallback (Playwright) when raw content is insufficient

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TailwindCSS, React Router v6, Recharts, Lucide React, Sonner |
| Backend | FastAPI (Python 3.11), Uvicorn |
| Database | MongoDB 7 with Motor (async driver) |
| Auth | PyJWT, bcrypt |
| HTML Parsing | BeautifulSoup4, lxml, httpx, curl_cffi, cloudscraper |
| Containerisation | Docker, Docker Compose |

### UI Design System
- Vision Pro-inspired glassmorphism, dark-first (`#0a0a0f` background)
- Brand colours: `#3A9BFF` (blue), `#60D5C8` (teal)
- Floating pill navbar, frosted-glass cards, animated gradient blobs
- Inter font, thin typography

---

## Project Structure

```
├── backend/
│   ├── server.py                    # FastAPI app entry point + middleware registration
│   ├── requirements.txt
│   ├── database/
│   │   └── connection.py            # MongoDB connection + index setup
│   ├── middlewares/
│   │   ├── auth_middleware.py        # JWT verification
│   │   ├── input_validation.py
│   │   ├── logging_middleware.py
│   │   ├── rate_limiter.py          # Per-IP + per-user token-bucket rate limiting
│   │   └── security_headers.py      # HTTP security response headers
│   ├── modules/
│   │   ├── auth/                    # Registration, login, JWT
│   │   ├── aeoEngine/               # AEO audit engine + hybrid HTML fetcher
│   │   ├── aiTestingEngine/         # AI citation testing + GEO scoring
│   │   ├── aiTestingLab/            # Multi-engine readiness lab
│   │   ├── advancedAudit/           # Per-signal explainability engine
│   │   ├── aiContentCompiler/       # Structured content extraction
│   │   ├── strategySimulator/       # What-if strategy simulation
│   │   ├── monitoring/              # Page monitoring + snapshot diffing
│   │   ├── reports/                 # Analytics overview, trends, competitors
│   │   └── enterprise/              # Competitor comparison, sensitivity modes, executive summary
│   └── utils/
│       └── helpers.py
├── frontend/
│   └── src/
│       ├── App.js                   # Routing + layout orchestration
│       ├── api.js                   # Axios API client
│       ├── context/AuthContext.js   # Auth state (JWT + user info)
│       ├── components/
│       │   ├── auth/                # Login + Register forms
│       │   ├── landing/             # Landing page sections
│       │   ├── layout/              # Navbar, Sidebar, Footer, AppBackground
│       │   ├── modals/              # Feature-locked modal
│       │   └── ui/                  # Shared UI primitives
│       └── pages/
│           ├── Dashboard.js
│           ├── AuditsPage.js
│           ├── AIVisibilityLabPage.js   # AI Testing Lab (multi-engine)
│           ├── AITestsPage.js
│           ├── AdvancedAuditPage.js
│           ├── SimulatorPage.js
│           ├── MonitoringPage.js
│           ├── ReportsPage.js
│           ├── CompetitorPage.js
│           ├── ExecutiveSummaryPage.js
│           ├── ProfilePage.js
│           └── LandingPage.js
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docs/
│   └── ARCHITECTURE.md
└── memory/
    └── PRD.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | User registration |
| POST | `/api/auth/login` | No | User login |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/audit` | Optional | Run AEO audit |
| GET | `/api/audit` | Yes | List user audits |
| GET | `/api/audit/{id}` | Yes | Get audit detail |
| POST | `/api/audit/advanced` | Yes | Run advanced audit with explainability |
| POST | `/api/ai-test` | Optional | Run AI citation + GEO test |
| GET | `/api/ai-test` | Yes | List AI tests |
| POST | `/api/ai-testing-lab/run` | Optional | Multi-engine lab analysis |
| POST | `/api/ai-testing-lab/quick-score` | Optional | Quick single-engine score |
| POST | `/api/compile` | Yes | Extract and compile page content |
| POST | `/api/simulate-strategy` | Yes | Simulate content strategy changes |
| POST | `/api/monitor` | Yes | Add page to monitoring |
| GET | `/api/monitor` | Yes | List monitored pages |
| POST | `/api/monitor/{id}/refresh` | Yes | Refresh page snapshot |
| GET | `/api/monitor/{id}/snapshots` | Yes | Snapshot history |
| GET | `/api/monitor/{id}/changes` | Yes | Detected signal changes |
| GET | `/api/reports/overview` | Yes | Analytics overview |
| GET | `/api/reports/trends` | Yes | Score trends (optional URL filter) |
| GET | `/api/reports/competitors` | Yes | Competitor data |
| POST | `/api/enterprise/compare` | Yes | Compare up to 5 competitor URLs |
| POST | `/api/enterprise/sensitivity-test` | Yes | Run test with custom sensitivity mode |

---

## Database Collections

| Collection | Purpose | Key Indexes |
|---|---|---|
| `users` | User accounts | `email` (unique) |
| `audits` | AEO audit results | `user_id`, `(user_id, created_at)` |
| `ai_tests` | AI citation + GEO results | `user_id`, `(user_id, created_at)` |
| `monitored_pages` | Pages under monitoring | `user_id`, `(user_id, url)` unique |
| `page_snapshots` | Append-only signal snapshots | `monitored_page_id`, `(monitored_page_id, fetched_at)` |
| `page_change_logs` | Detected signal changes | `monitored_page_id`, `(monitored_page_id, detected_at)` |

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB 7 (local install or [MongoDB Atlas](https://www.mongodb.com/atlas))

---

## Running Locally

### 1. Backend

```bash
cd backend
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=pinnacle
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY_HOURS=24
```

Install dependencies and start the server:

```bash
pip install -r requirements.txt
uvicorn server:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

---

### 2. Frontend

```bash
cd frontend
```

Create a `.env` file in the `frontend/` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Install dependencies and start the dev server:

```bash
npm install
npm start
```

The app will open at `http://localhost:3000`.

---

## Running with Docker

From the project root:

```bash
cd docker
docker compose up --build
```

This starts MongoDB (port `27017`), the backend (port `8001`), and the frontend (port `3000`) together.

Optionally create `backend/.env` and `frontend/.env` to override defaults before running. The default `JWT_SECRET` in the compose file must be replaced before any production deployment.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Database name (e.g. `pinnacle`) |
| `JWT_SECRET` | Yes | Secret key for signing JWTs (min 32 chars) |
| `JWT_EXPIRY_HOURS` | No | Token lifetime in hours (default: `24`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_BACKEND_URL` | Yes | Base URL of the backend API |

---

## Known Limitations

- Pages behind aggressive Cloudflare or bot-protection may return incomplete content. The hybrid fetcher attempts headless rendering as a fallback but cannot guarantee results for all protected sites.
- Rate limiting uses an in-memory store, so limits reset on server restart and are not shared across multiple backend instances.

---

## Contributing

Contributions are welcome. Please open an issue before submitting large changes, and ensure both the backend tests (`pytest`) and frontend build pass before raising a pull request.

## License

Add license information here.
