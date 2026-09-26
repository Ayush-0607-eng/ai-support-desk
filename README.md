# AI SupportDesk

Full-stack, multi-tenant, AI-powered customer support platform. React + TypeScript frontend, Node/Express + MongoDB backend with real-time updates via Socket.IO, and a Python FastAPI RAG service using free local embeddings (sentence-transformers) and FAISS, with an OpenAI-compatible LLM call (defaults to Groq's free tier).

## Project structure

```
ai-support-desk/
  backend/        Node/Express API, MongoDB models, JWT auth, Socket.IO
  ai-service/     FastAPI RAG service (embeddings + vector search + LLM call)
  frontend/       React + TypeScript + Tailwind dashboard
  docker-compose.yml
```

## Running with Docker (recommended)

Install Docker Desktop (free): https://www.docker.com/products/docker-desktop/

```
docker compose up --build
```

Frontend: http://localhost:4173, backend: http://localhost:5000, AI service: http://localhost:8000.

If you're on MongoDB Atlas and hit `querySrv ECONNREFUSED` errors, Docker's default DNS sometimes can't resolve Atlas's `mongodb+srv://` records — this is already worked around in `docker-compose.yml` by pointing the backend container at Google's public DNS (8.8.8.8 / 8.8.4.4).

One thing worth knowing if you ever edit `frontend/.dockerignore`: Vite bakes `VITE_API_URL` into the compiled JavaScript at build time, not at container runtime, so `.env` must be present during `npm run build` inside the image. Do not add `.env` or `.env.*` to `frontend/.dockerignore` (backend and ai-service are fine to exclude `.env` there, since those two read env vars at runtime via `env_file` in Compose instead).

If you change ports, update three places to match: `docker-compose.yml`'s host-side port mapping, `frontend/.env`'s `VITE_API_URL`, and `backend/.env`'s `CLIENT_URL`.

## Running locally without Docker

### MongoDB
Use a free MongoDB Atlas cluster (recommended, no local install needed): https://www.mongodb.com/cloud/atlas/register

### Backend
```
cd backend
npm install
npm run dev
```
Runs on http://localhost:5000

### AI service
```
cd ai-service
python -m venv venv
venv\Scripts\activate        (Windows)
source venv/bin/activate     (Mac/Linux)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Runs on http://localhost:8000. The first run downloads the embedding model (~90MB), needs internet once.

### Frontend
```
cd frontend
npm install
npm run dev
```
Runs on http://localhost:5173. If running locally instead of Docker, set `CLIENT_URL=http://localhost:5173` in `backend/.env` to match.

## Environment variables to replace

### backend/.env
- `MONGO_URI` — your MongoDB Atlas connection string.
- `JWT_SECRET` — any long random string, used to sign auth tokens.
- `AI_SERVICE_API_KEY` — must match `API_KEY` in `ai-service/.env`, any string you choose.
- `EMAIL_USER` / `EMAIL_PASS` — your Gmail address and a 16-character Gmail App Password (see Outbound email below).

### ai-service/.env
- `API_KEY` — must match `AI_SERVICE_API_KEY` in `backend/.env`.
- `LLM_API_KEY` — your LLM provider key. Recommended free option: Groq (https://console.groq.com/keys), generous free tier, OpenAI-compatible, no credit card required. Paste the key here and leave `LLM_API_BASE_URL` and `LLM_MODEL` as-is, or change them to point at OpenAI, OpenRouter, or a local Ollama server. Check `https://api.groq.com/openai/v1/models` with your key to see which model IDs are currently valid, since availability changes.
- If you leave `LLM_API_KEY` unset, the AI draft feature returns a placeholder message instead of crashing, everything else still works.

### frontend/.env
- `VITE_API_URL` — backend URL, already set to `http://localhost:5000/api`.

## Free deployment options (0 cost)

- Frontend: Vercel or Netlify free tier
- Backend + AI service: Render.com free tier (spins down when idle) or Railway free tier
- Database: MongoDB Atlas free M0 cluster (512MB, enough to start)
- LLM: Groq free tier
- Outbound email: Gmail SMTP (500/day limit)

## Multi-tenancy

This app is multi-tenant. On the register page, choose **New workspace** to create your own organization (you become its admin and get an invite code), or **Join with invite** to join an existing organization as an agent using its invite code. Every organization's tickets, knowledge base, team chat, and team are fully isolated from every other organization, including in the AI service's vector search. Admins can find their workspace's invite code under Settings, to share with teammates who should join as agents.

## Roles and permissions

Only admins can create tickets and assign one or more agents to each ticket (via checkboxes on the ticket detail page). Only the admin or an agent actually assigned to a ticket can reply, generate an AI draft, or approve one — other agents can view the ticket but the reply box is replaced with a notice explaining why.

## Real-time updates

The backend runs a Socket.IO server alongside the REST API, authenticated with the same JWT as the REST API over the socket handshake. New tickets, ticket updates (status, assignment), and new ticket messages broadcast instantly to everyone in the same organization — no page refresh needed.

## Knowledge base and PDF uploads

Add articles by pasting text, or upload a PDF directly — the backend extracts its text server-side (`pdf-parse`) and sends it through the same RAG ingestion pipeline as manually typed articles. AI drafts only cite knowledge base content above a similarity threshold, and will honestly say it found nothing relevant rather than guessing when your knowledge base doesn't cover a topic.

## Team chat

A dedicated real-time chat page (sidebar → Team chat) lets everyone in a workspace message each other, WhatsApp-style, with each message labeled by sender name and role. Backed by Socket.IO and a `ChatMessage` collection scoped per organization.

## Outbound email

Agent replies and approved AI drafts are emailed to the customer automatically via Gmail SMTP (Nodemailer). Requires 2-Step Verification enabled on the sending Google account, with an App Password generated at myaccount.google.com/apppasswords (16 characters, no spaces).

## Dashboard

Two pie charts — tickets by status (open/pending/resolved/closed) and by urgency (low/medium/high/urgent) — plus live stat cards, recent tickets, and a "New ticket" button (admin only).

## Features

- JWT authentication, multi-tenant organizations with invite codes
- Real-time updates across tickets, messages, and team chat via Socket.IO
- Ticket creation (admin only), multi-agent assignment, filtering, search, status and priority management
- Reply permissions scoped to admin and assigned agents only
- Threaded ticket conversation with customer, agent and AI messages
- RAG-powered AI draft replies grounded in your knowledge base (text or PDF), with source citations
- Agent approval flow before an AI draft is sent to the customer, plus outbound email delivery
- Thumbs up/down feedback capture on AI replies
- Team chat page for internal workspace communication
- Dashboard with live stats and two pie charts (status, urgency)
- Violet themed UI, full dark mode, responsive from mobile to desktop
