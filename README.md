# ExamBuddy: Texas P&C AI Coach

This monorepo contains the frontend (React + Vite + Tailwind CSS) and backend (Node.js + Express) for the ExamBuddy MVP.

## Structure

- `client/`: Frontend React app
- `server/`: Backend Express API
- `shared/`: Shared data (topics, schemas)

## Quick Start

### 1. Backend (server)
```
cd server
npm install
cp .env.example .env # Add your OpenAI API key
npm run dev
```

### 2. Frontend (client)
```
cd client
npm install
npm run dev
```

### 3. Shared
No setup needed for MVP.

---

## API Endpoints

- `POST /api/generate-question` — Generate a new question
- `POST /api/evaluate-answer` — Evaluate answer and provide feedback

---

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- AI: OpenAI GPT-4 (API key required)

---

## License
MIT
