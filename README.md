# EduAssess AI

This project now uses a **React + Vite frontend** with a fully migrated **Java Spring Boot backend** in **MVC style**.

## Architecture

- `src/` → Frontend (React + Vite)
- `backend/` → Spring Boot backend
  - `controller/` → REST controllers
  - `service/` → business logic
  - `repository/` → data/mock provider layer
  - `model/` and `dto/` → domain and API payload classes
  - `config/` → CORS and app configuration

## Backend APIs

The backend exposes the same API surface expected by the frontend:

- `GET /api/health`
- `POST /api/ingest-pdf` (multipart form-data with `pdf`, optional `subjectId`, `className`)
- `POST /api/generate-paper`

## Prerequisites

- Node.js (for frontend)
- Java 17+
- Maven

## Environment Variables

For real AI generation, set:

- `GEMINI_API_KEY=<your_key>`

If missing, backend runs in **mock mode** and returns sample data.

## Run Locally

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Start Spring Boot backend (port 8080)

```bash
npm run dev:backend
```

### 3) Start frontend (port 5173)

```bash
npm run dev
```

Vite is configured to proxy `/api` requests to `http://localhost:8080`.

## Build

- Frontend: `npm run build`
- Backend: `npm run build:backend`
