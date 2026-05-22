from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.weather import router as weather_router
from app.database import engine, Base
from app.models import CitySnapshot

app = FastAPI(
    title="EarthPulse AI",
    description="Real-Time Global Sustainability & Risk Intelligence Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created")

@app.get("/")
async def root():
    return {
        "message": "EarthPulse AI is running...",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health():
    return {"status": "ok"}