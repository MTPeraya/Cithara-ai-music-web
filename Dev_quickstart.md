# 🎸 Cithara - Developer Quick Start Guide

> **Transforming prompts into music.** This guide provides everything a developer needs to set up, run, and contribute to the Cithara AI Music Generator.

---

## 🚀 Choose Your Path

Cithara supports two primary development workflows. Choose the one that fits your needs:

- **Path A: Solo (Native)** - Best for rapid iteration and deep debugging with local IDE tools.
- **Path B: Docker** - Best for a consistent environment that "just works" out of the box.

---

## 🛠️ Path A: Solo (Native) Setup

### 1. Prerequisites
- **Python 3.10+** (Django Backend)
- **Node.js 18+** & `npm` (React Frontend)
- **Git**

### 2. Environment Initialization
```bash
# Clone the repository
git clone https://github.com/MTPeraya/Cithara-ai-music-web.git
cd Cithara-ai-music-web

# Setup Python Virtual Environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Configure Environment Variables
cp .env.example .env
# Open .env and set your preferences!
```

### 3. Backend (Django)
```bash
cd Cithara
pip install -r requirements.txt

# Database and Admin
python3 manage.py migrate
python3 manage.py createsuperuser  # Recommended: admin/admin
python3 manage.py runserver
```

### 4. Frontend (React + Vite)
Open a new terminal window:
```bash
cd Cithara-ai-music-web/frontend
npm install
npm run dev
```

---

## 🐳 Path B: Docker Setup

The entire stack can be launched with a single command. **Hot-reloading is fully supported** via volume mounts for both frontend and backend.

```bash
# From the project root
docker-compose up --build
```

---

## 🏗️ Generation Strategies (Strategy Pattern)

Cithara uses a **Strategy Design Pattern** to handle music generation. You can swap behaviors without changing your core domain logic.

| Strategy | Selection Flag | Description |
| :--- | :--- | :--- |
| **Mock** | `GENERATOR_STRATEGY=mock` | **Offline Mode.** Generates instant results with dummy audio links. No API key needed. |
| **Suno** | `GENERATOR_STRATEGY=suno` | **Live Mode.** Connects to Suno API. Requires a valid `SUNO_API_KEY` in `.env`. |

> [!IMPORTANT]
> **API Key Security:** Never commit your `.env` file. It is already included in `.gitignore` and `.dockerignore` to prevent accidental exposure of your Suno credentials.

---

## 🧪 Verification & Testing

### 1. Domain Integrity Test
Verify the end-to-end CRUD lifecycle and Strategy pattern behavior:
```bash
# From the root directory (Native Path)
python3 test_crud.py
python3 Cithara/test_strategy.py
```

### 2. Django Unit Tests
```bash
cd Cithara
python3 manage.py test
```

---

## 📂 Project Architecture

```text
Cithara-ai-music-web/
├── Cithara/             # Django Backend
│   ├── domain/          # Core Domain Architecture
│   │   ├── models/      # Data entities & constraints
│   │   ├── strategies/  # Song Generation implementation
│   │   └── views.py     # API ViewSets
│   └── Cithara/         # Project Settings & Routing
├── frontend/            # React + Vite Frontend
│   ├── src/             # UI Components & States
│   └── public/          # Static assets
└── docker-compose.yml   # Container Orchestration
```

---

## 💡 Troubleshooting

Having issues with Docker, migrations, or the Suno API? Please refer to our centralized [Troubleshooting Guide](./TROUBLESHOOTING.md).


---

© 2024 Cithara Development Team
