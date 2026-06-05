# EarthPulse AI

Real-time environmental intelligence platform — live AQI monitoring, weather tracking, ML-based forecasting, and AI-generated insights for cities worldwide.

**Live:** [earthpulse-ai-ebon.vercel.app](https://earthpulse-ai-ebon.vercel.app) &nbsp;|&nbsp; **API:** [earthpulse-ai-slaa.onrender.com/docs](https://earthpulse-ai-slaa.onrender.com/docs)

---

## What it does

Search any city and get:

- **Live AQI + weather** — real-time data from WAQI and OpenWeatherMap
- **EarthPulse Risk Score** — composite environmental risk index (0–100) based on AQI, heat stress, humidity, and pollutant type
- **72h AQI Forecast** — XGBoost ML model predicting hourly air quality
- **AI Insight** — plain English analysis of current conditions via Llama 3 (Groq)
- **Global Map** — interactive world map with color-coded AQI markers for 12+ cities
- **City Comparison** — side-by-side environmental data for two cities

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Recharts, Leaflet |
| Backend | FastAPI, Python, APScheduler |
| Database | PostgreSQL + PostGIS (Docker) |
| ML | XGBoost, Scikit-learn, NumPy |
| AI | Llama 3 via Groq API |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Project Structure

```
earthpulse-ai/
├── frontend/
│   └── src/
│       ├── components/     # CityCard, Map, ForecastChart, RiskScore, etc.
│       ├── services/api.js # Axios instance
│       └── App.jsx
├── backend/
│   └── app/
│       ├── api/            # Route handlers
│       ├── models/         # SQLAlchemy models
│       ├── services/       # weather, insights, predictor, risk_score
│       ├── main.py         # FastAPI app + scheduler
│       ├── database.py
│       └── config.py
├── docker-compose.yml
└── README.md
```

---

## Running Locally

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Python 3.11+
- Node.js 18+

### 1. Clone and set up

```bash
git clone https://github.com/2504-tulika/earthpulse-ai.git
cd earthpulse-ai
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql+asyncpg://earthpulse:earthpulse123@localhost:5432/earthpulse
SYNC_DATABASE_URL=postgresql://earthpulse:earthpulse123@localhost:5432/earthpulse
OPENWEATHER_API_KEY=your_key_here
WAQI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

Start the server:

```bash
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`

### 4. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/city/{city}` | Weather + AQI + risk score |
| GET | `/api/v1/weather/{city}` | Weather only |
| GET | `/api/v1/aqi/{city}` | AQI only |
| GET | `/api/v1/insight/{city}` | AI-generated insight |
| GET | `/api/v1/predict/{city}` | 72h AQI forecast |
| GET | `/api/v1/risk/{city}` | Risk score breakdown |
| GET | `/api/v1/cities/snapshot` | Cached data for all map cities |
| POST | `/api/v1/cities/refresh` | Force refresh city cache |
| GET | `/health` | Health check + scheduler status |

---

## How the EarthPulse Risk Score Works

A composite index built from four weighted components:

| Component | Weight | Based On |
|-----------|--------|----------|
| AQI impact | 40% | US EPA AQI scale |
| Heat stress | 25% | NOAA Heat Index thresholds |
| Humidity stress | 15% | Comfort range research |
| Pollutant danger | 20% | WHO pollutant toxicity rankings |

Scores: `0–20` Very Low · `21–40` Low · `41–55` Moderate · `56–70` High · `71–85` Very High · `86–100` Extreme

---

## ML Forecast Model

The XGBoost model is trained on domain-knowledge-based synthetic data that captures real AQI behavioral patterns:

- Morning and evening rush hour spikes (7–10am, 5–8pm)
- Weekend traffic reduction effect
- Wind speed inversely reducing AQI
- Humidity amplifying particulate concentration
- Cyclic time features (sin/cos encoding of hour and day of week)

**Note:** Current training data is synthetic. Roadmap includes retraining on the [OpenAQ](https://openaq.org) historical dataset for validated predictions.

---

## Data Sources

- **[OpenWeatherMap](https://openweathermap.org/api)** — weather data
- **[WAQI](https://aqicn.org/api/)** — air quality index from 30,000+ monitoring stations
- **[Groq](https://console.groq.com)** — Llama 3 inference for AI insights
- **[CARTO](https://carto.com)** — map tiles (Voyager style)

---

## Deployment

Backend is deployed on [Render](https://render.com) with a PostgreSQL + PostGIS database.
Frontend is deployed on [Vercel](https://vercel.com).

A background scheduler auto-refreshes city data every 30 minutes. On first startup, 12 default cities are cached immediately.

> Note: Render free tier spins down after 15 minutes of inactivity. First request may take 20–30 seconds to wake up.

---

## License

MIT
