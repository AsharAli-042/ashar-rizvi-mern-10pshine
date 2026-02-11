# Solar Notes App

**Full-stack Notes application** — React (Vite + Tailwind) frontend and Node.js (Express) backend with Prisma ORM (MySQL).  
Features: authentication (JWT), rich-text notes editor, pinning/favorites, search, user profile (avatar + change password), structured logging (Pino), unit tests, and automated SonarCloud quality checks.

## Table of contents

1. [Project overview](#project-overview)  
2. [Key features](#key-features)  
3. [Tech stack](#tech-stack)  
4. [Architecture overview](#architecture-overview)  
5. [Prerequisites](#prerequisites)  
6. [Quickstart — Local development](#quickstart---local-development)  
   - [Backend setup](#backend-setup)  
   - [Frontend setup](#frontend-setup)  
7. [Database & Prisma migrations](#database--prisma-migrations)  
8. [Testing & coverage](#testing--coverage)  
9. [SonarCloud (quality & security scanning)](#sonarcloud-quality--security-scanning)  
10. [API reference (summary)](#api-reference-summary)  
11. [Repository structure](#repository-structure)  
12. [Operational notes & security](#operational-notes--security)  
13. [Contributing](#contributing)  
14. [Troubleshooting](#troubleshooting)  
15. [License & acknowledgements](#license--acknowledgements)


## Project overview

Solar Notes is a production-oriented notes application built as an internship project. It demonstrates a modern web stack, clean server architecture, database-backed features, structured logging, automated testing, and automated code-quality scanning.


## Key features

- User registration, login (JWT) and authentication middleware  
- Responsive dashboard with notes listing and quick actions  
- Rich-text note editor (Quill) — content stored as HTML string  
- Note pinning and favorites with server-side sorting & indexed queries  
- Favorite-notes server-side search (`GET /api/v1/notes/favorites/search?q=`)  
- Profile support: avatar upload and authenticated change-password endpoint  
- Structured JSON logging (Pino) with sensitive data redaction  
- Unit tests (backend: Mocha/Chai/Sinon; frontend: Jest/RTL) and coverage reports  
- SonarCloud integration via GitHub Actions for automated quality/security checks


## Tech stack

**Frontend**
- React (Vite)  
- Tailwind CSS  
- react-quill (rich text editor)  
- axios (API client)  
- Jest + React Testing Library

**Backend**
- Node.js (Express)  
- Prisma ORM + MySQL (or PostgreSQL)  
- jsonwebtoken (JWT auth)  
- bcrypt (password hashing)  
- pino + pino-http (logging)   
- Mocha + Chai + Sinon + Supertest  
- nyc (lcov coverage)

**Other**
- GitHub (repo + Actions)  
- SonarCloud (code quality & security)


## Architecture overview

- **Frontend**: SPA served by Vite in development; production build is static assets. AuthProvider centralizes token & user state. API layer (axios client) attaches `Authorization` header and handles 401s.
- **Backend**: Express app with modular routers (`/auth`, `/notes`, `/users`). Controller → Service → Model separation for testability. Prisma manages DB access and migrations. Middleware layers handle auth, error handling, and request logging (Pino).
- **CI/Quality**: GitHub Actions runs tests and produces LCOV coverage files; SonarCloud action analyzes code and displays a quality gate.

## Prerequisites

- Node.js (18+ recommended) and npm  
- MySQL server (or PostgreSQL) for local DB — connection via `DATABASE_URL`  
- GitHub account with repo (SonarCloud integration assumes public repo for free tier)


## Quickstart — Local development

> These commands assume a monorepo layout with `frontend/` and `backend/` directories at repo root.

### Backend setup

1. Copy env example and edit:
```bash
cd backend
cp .env.example .env
# Edit .env and set DATABASE_URL, JWT_SECRET, etc.

#### .env (example keys):

NODE_ENV=development
PORT=5000
DATABASE_URL="mysql://user:pass@localhost:3306/notesdb"
JWT_SECRET=change_this
JWT_EXPIRES_IN=1h
LOG_LEVEL=info

```

2. **Install dependencies and generate Prisma client:**

```bash
npm install
npx prisma generate

```

3. **Run migrations (dev):**

```bash
npx prisma migrate dev --name init

```

4. **Start in dev mode:**

```bash
npm run dev
# or
npm run start

```

**Health check**: `GET http://localhost:5000/health`

### Frontend setup

1. **Copy env example and edit:**

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api/v1

```

2. **Install and run:**

```bash
npm install
npm run dev
# Vite dev server usually at http://localhost:5173

```

## Database & Prisma migrations

Modify `prisma/schema.prisma` for model changes.

**Create migration:**

```bash
cd backend
npx prisma migrate dev --name <migration-name>
npx prisma generate

```

**For production, use:**

```bash
npx prisma migrate deploy
```

> **Tip**: Always backup your production DB before applying migrations.


## Testing & coverage

### Backend (Mocha / nyc)

**Run unit tests:**

```bash
cd backend
npm ci
cross-env NODE_ENV=test npm test

```

**Generate coverage (lcov):**

```bash
npm run coverage
# coverage/lcov.info will be created

```

### Frontend (Jest)

**Run tests:**

```bash
cd frontend
npm ci
npm test

```

**Generate coverage (lcov):**

```bash
npm run test:coverage
# coverage/lcov.info created (usually under frontend/coverage)

```

SonarCloud reads these LCOV files for reporting.

## SonarCloud (quality & security scanning)

**Integration**: GitHub Actions workflow triggers SonarCloud analysis on pushes and PRs. The repository includes:

* `sonar-project.properties` (repo root) — sets `sonar.organization`, `sonar.projectKey`, `sonar.sources`, `sonar.javascript.lcov.reportPaths`, and exclusions.
* `.github/workflows/sonar.yml` — Action that runs tests and triggers SonarCloud analysis.

**Important items**

* Add Sonar token as a repository secret named `SONAR_TOKEN`.
* Ensure coverage LCOV files exist at the paths configured in `sonar-project.properties` before Sonar step runs.


## API reference (summary)

Base prefix: `/api/v1` — responses follow:

* **Success**: `{ success: true, data: ... }`
* **Error**: `{ success: false, error: { message, code, details } }`

### Auth

* `POST /auth/register` — `{ name, email, password }` → `{ token, user }`
* `POST /auth/login` — `{ email, password }` → `{ token, user }`
* `POST /auth/forgot-password` — `{ email }` → generic success
* `POST /auth/reset-password` — `{ token, newPassword }`

### Notes

* `GET /notes` — list notes (optional query params: `q`, `favorites=true`)
* `POST /notes` — create
* `GET /notes/:id` — read
* `PATCH /notes/:id` — update
* `DELETE /notes/:id` — delete
* `PATCH /notes/:id/pin` — `{ isPinned: true|false }` — pin/unpin
* `GET /notes/favorites/search?q=` — server-side favorite search

### Users / Profile

* `GET /users/me` — get profile
* `PATCH /users/me` — update profile (name, avatarUrl)
* `POST /users/me/change-password` — `{ currentPassword, newPassword }`

**Authentication**: Protected routes require header:
`Authorization: Bearer <JWT_TOKEN>`


## Repository structure (high level)

```text
/backend
  /src
    /config
    /controllers
    /services
    /models
    /routes
    /middlewares
    /utils
  prisma/
  test/
  package.json

/frontend
  /src
    /__tests__
    /api
    /auth
    /components
    /lib
    /pages
    /routes
    /utils
  package.json

sonar-project.properties
.github/workflows/sonar.yml
README.md

```


## Operational notes & security

* **Do not commit** `.env` or any secrets. Use `.env.example` for required variables.
* **Passwords** are hashed with bcrypt (salt rounds configurable).
* **Pino redaction** prevents logging of sensitive fields (passwords, tokens).
* **JWT advice**: For production, consider short-lived access tokens and httpOnly refresh tokens.


## Contributing

1. **Fork the repo** → Create a feature branch: `feature/<area>-<short-desc>` (or `chore/ci/sonar` for CI changes)
2. **Commit** with clear messages and open a PR to develop.
3. **Ensure tests pass** locally and coverage is generated when required.
4. **PRs must include** any schema/migration changes (`prisma migrate dev`) and documentation updates.

---

## Troubleshooting (common issues)

* **Missing LCOV file in SonarCloud**: Ensure `npm run coverage` / `npm run test:coverage` ran and produced `coverage/lcov.info`. Check paths in `sonar-project.properties`.
* **401 from API in frontend**: Token invalid or expired — clear token in localStorage and re-login.
* **Prisma errors**: Run `npx prisma generate`, check `DATABASE_URL` in `.env`.
* **Tests failing in CI only**: Check timeouts and `NODE_ENV=test` and ensure non-deterministic external calls are mocked.


## License & acknowledgements

This project is an educational/internship project. Adapt the license to your needs; suggested LICENSE: **MIT**.

**Thanks to the open-source projects used throughout:**
React, Vite, Tailwind, Quill, Express, Prisma, Mocha/Chai, Jest, Pino, SonarCloud.
