# AeroGrid: UK Wind Forecast Intelligence Dashboard

AeroGrid is a production-minded energy analytics platform designed for UK electricity utilities and trading desks. It evaluates national wind generation forecasts available at day-ahead purchasing decision times against actual outturn generation from Elexon BMRS to uncover forecast errors and wind generation shortfalls.

---

## 1. Project Overview & Methodology

- **Target Horizon:** UK National Wind Generation for **January 2026**.
- **Data Sources (Elexon BMRS Insights Solution):**
  - **Actual Outturns:** `GET /datasets/FUELHH/stream` filtered to `fuelType=WIND`.
  - **Forecast Snapshots:** `GET /datasets/WINDFOR/stream` published by National Grid ESO.
- **Mathematical Error Convention:**
  $$\text{errorMW} = \text{actualMW} - \text{forecastMW}$$
  - $\text{errorMW} < 0$: Actual generation was below forecast (**Wind Shortfall / Volume Deficit**).
  - $\text{errorMW} > 0$: Actual generation was above forecast (**Wind Surplus / Volume Excess**).
- **Interval Energy:** Half-hourly average MW values convert to energy as:
  $$\text{Interval Energy (MWh)} = \text{MW} \times 0.5\text{ hours}$$
  $$\text{Wind Shortfall Energy (MWh)} = \max(\text{forecastMW} - \text{actualMW}, 0) \times 0.5\text{ hours}$$
- **Day-Ahead Decision Cutoff Policy:**
  - Day-ahead power is traded prior to market auction deadlines (e.g., EPEX SPOT GB Day-Ahead auction at 11:00 GMT on $D-1$).
  - For historical evaluation, **no forecast published after the decision cutoff is ever selected**.
  - In Phase 1, the cutoff time is treated as a configurable trading assumption (`11:00 UTC` default in `DEFAULT_DECISION_CUTOFF_TIME`), strictly isolated in backend configuration so it can be verified and modified without altering domain calculations or frontend components.

---

## 2. Architecture & Technology Stack

```
AeroGrid/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/routes/       # Endpoints (/health, /api/v1/...)
│   │   ├── core/             # Configuration (pydantic-settings) & logging
│   │   ├── domain/           # Forecast selection & metric calculation engines
│   │   ├── schemas/          # Pydantic request/response validation schemas
│   │   ├── services/         # Upstream Elexon HTTPX client with caching
│   │   └── main.py           # FastAPI app instance with CORS middleware
│   ├── tests/                # Automated pytest suite
│   ├── requirements.txt      # Runtime dependencies
│   ├── requirements-dev.txt  # Testing dependencies
│   └── Dockerfile
├── frontend/                 # React TypeScript Frontend (Vite)
│   ├── src/
│   │   ├── components/       # Layout, KPI cards, charts, audit timeline, table
│   │   ├── services/         # API HTTP client
│   │   ├── types/            # TypeScript interfaces synchronized with Pydantic
│   │   ├── styles/           # Tailwind CSS theme tokens (navy/white/emerald)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml        # Multi-service local orchestration
├── .env.example              # Environment variables template
├── .gitignore
└── README.md
```

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Python 3.12, FastAPI, Pydantic v2, HTTPX, NumPy, Pytest.
- **Orchestration:** Docker, Docker Compose, Nginx.

---

## 3. Local Development Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm 9+
- Docker & Docker Compose (optional for containerized execution)

### A. Environment Configuration
Copy `.env.example` to `.env` in the project root:
```powershell
# In PowerShell (Windows)
copy .env.example .env

# In Bash (Linux/macOS)
cp .env.example .env
```

### B. Running the Backend Locally
```powershell
cd D:\AeroGrid\backend

# Install dependencies
python -m pip install -r requirements.txt -r requirements-dev.txt

# Run automated tests
python -m pytest tests -v

# Start FastAPI development server (with hot reload)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Docs (Swagger): [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### C. Running the Frontend Locally
Open a second PowerShell terminal:
```powershell
cd D:\AeroGrid\frontend

# Install dependencies
npm install

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build

# Start Vite development server
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 4. Docker Compose Orchestration

To run the complete AeroGrid stack in isolated containers:

```powershell
cd D:\AeroGrid

# Build and start all services
docker compose up --build -d

# View service logs
docker compose logs -f

# Check container health status
docker compose ps

# Tear down containers
docker compose down
```

Once running:
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **Backend Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 5. Security & Verification Standard

- **No Committed Secrets:** API keys and environment variables are strictly managed through `.env` (ignored by `.gitignore`).
- **Mathematical Integrity:** Real Elexon data streams are matched strictly on half-hourly delivery UTC timestamps. Missing data is never coerced to zero.
- **Scope Discipline:** Operational metrics report strictly on wind volume discrepancies without displaying speculative financial exposure or demand balances outside the project scope.
