# AI Discoverability Copilot - Phase 0: Architecture

## Overview
AEO/GEO SaaS platform for analyzing webpage performance in AI-generated answers.

## Tech Stack
- **Frontend**: React 18, TailwindCSS, React Router
- **Backend**: FastAPI (Python 3.11)
- **Database**: MongoDB (Motor async driver)
- **Auth**: JWT (PyJWT + bcrypt)
- **Docker**: Reference Dockerfiles + docker-compose

## Project Structure

```
/app
├── backend/
│   ├── server.py                    # FastAPI app entry point
│   ├── .env                         # Backend environment variables
│   ├── requirements.txt             # Python dependencies
│   ├── database/
│   │   └── connection.py            # MongoDB connection + indexes
│   ├── modules/
│   │   └── auth/
│   │       ├── models.py            # Pydantic request/response models
│   │       ├── routes.py            # Auth API routes
│   │       └── service.py           # Auth business logic
│   ├── middlewares/
│   │   ├── auth_middleware.py        # JWT verification middleware
│   │   └── logging_middleware.py     # Request logging middleware
│   └── utils/
│       └── helpers.py               # Utility functions
├── frontend/
│   ├── src/
│   │   ├── App.js                   # Main app with routing
│   │   ├── context/
│   │   │   └── AuthContext.js       # Auth state management
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.js     # Login form
│   │   │   │   └── RegisterPage.js  # Registration form
│   │   │   └── layout/
│   │   │       ├── Layout.js        # App layout with sidebar
│   │   │       └── Sidebar.js       # Navigation sidebar
│   │   └── pages/
│   │       └── Dashboard.js         # Dashboard overview
│   └── tailwind.config.js           # TailwindCSS config
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
└── docs/
    └── ARCHITECTURE.md              # This file
```

## API Endpoints

| Method | Endpoint          | Auth | Description            |
|--------|-------------------|------|------------------------|
| GET    | /api/health       | No   | Health check           |
| POST   | /api/auth/register| No   | User registration      |
| POST   | /api/auth/login   | No   | User login             |
| GET    | /api/auth/me      | Yes  | Get current user       |

## Database Collections

| Collection       | Purpose                          | Key Indexes              |
|------------------|----------------------------------|--------------------------|
| users            | User accounts                    | email (unique)           |
| audits           | Page audit results               | user_id, created_at      |
| ai_tests         | AI citation test results         | user_id, created_at      |
| monitored_pages  | Pages being tracked              | user_id+url (unique)     |
| page_snapshots   | Append-only page signal history  | monitored_page_id        |
| page_change_logs | Detected signal changes          | monitored_page_id        |

## Architecture Principles
- All database queries scoped by user_id
- Append-only architecture for snapshots (never overwrite)
- JWT-based authentication with protected routes
- Modular backend structure for scalability
- Centralized error handling + logging middleware
