# CITHARA - Developer Quick Start Guide

This guide provides developers with the necessary steps to set up, run, and test Cithara.

## 1. Development Paths

You can develop Cithara using two primary methods:

- **Path A: Solo (Native)** - Run everything directly on your machine. Best for rapid iteration and debugging.
- **Path B: Docker** - Run everything in containers. Best for consistent environments and testing deployments.

---

## 2. Path A: Solo (Native) Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** (with `npm`)
- **Git**

### Step 1: Clone and Environment
```bash
git clone https://github.com/MTPeraya/Cithara-ai-music-web.git
cd Cithara-ai-music-web

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate

# Setup environment variables
cp .env.example .env
# Edit .env to set GENERATOR_STRATEGY and SUNO_API_KEY
```

### Step 2: Backend Setup (Django)
```bash
cd Cithara
pip install -r requirements.txt

# Database initialization
python3 manage.py migrate
python3 manage.py createsuperuser  # Set admin/admin
python3 manage.py runserver
```

### Step 3: Frontend Setup (Vite)
Open a new terminal:
```bash
cd Cithara-ai-music-web/Frontend
npm install
npm run dev
```

---

## 3. Path B: Docker Setup

The fastest way to get a full environment up and running.

```bash
# From the root directory (Cithara-ai-music-web)
docker-compose up --build
```

**Hot-Reloading:**
- Backend code in `Cithara/` and Frontend code in `Frontend/` are volumed into the containers. Changes will trigger automatic reloads.

---

## 4. Key Access Points

| Service | Solo URL | Docker URL |
|---------|----------|------------|
| Frontend UI | `http://localhost:5173` | `http://localhost:5173` |
| Backend API | `http://localhost:8000/api` | `http://localhost:8000/api` |
| Django Admin | `http://localhost:8000/admin` | `http://localhost:8000/admin` |

---

## 5. Domain Model & Business Logic

### Core Entities
- **User**: Authenticated user (1:1 with Library)
- **Library**: Song collection (up to 1M songs)
- **Song**: Generated audio item (belongs to Library)
- **ShareLink**: Public access token for a Song (1:1 with Song)

### Strategy Pattern (Generation Logic)
We use a strategy pattern to switch between generation modes:
- **Mock**: No API keys required, instant generation with dummy links.
- **Suno**: Connects to Suno AI API (requires `SUNO_API_KEY` in `.env`).

To switch, update `GENERATOR_STRATEGY` in your `.env` or export the variable before running:
```bash
export GENERATOR_STRATEGY=suno
```

---

## 6. Testing

### Backend CRUD Test
A dedicated script tests the full domain lifecycle (Create, Read, Update, Delete with cascade).
```bash
# From root directory
python3 test_crud.py
```

### Django Unit Tests
```bash
cd Cithara
python3 manage.py test
```

---

## 7. Troubleshooting

- **Port in Use**: If `8000` or `5173` are busy, use `python3 manage.py runserver 8001` or check `vite.config.js`.
- **Database Locked**: If using SQLite locally and it locks, run `rm Cithara/db.sqlite3 && python3 manage.py migrate`.
- **Node Modules**: If the frontend fails to start in Docker, try `rm -rf Frontend/node_modules` and rebuild.

---

## 8. Directory Structure

```text
Cithara-ai-music-web/
├── Cithara/             # Django Backend
│   ├── domain/          # Core Domain Logic & Models
│   ├── Cithara/         # Settings & Routing
│   └── manage.py
├── Frontend/            # Vite + React Frontend
│   ├── src/             # Components & Logic
│   └── package.json
├── docker-compose.yml   # Docker Orchestration
├── .env.example         # Environment template
└── test_crud.py         # Integrity script
```



