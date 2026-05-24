import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.weather import router as weather_router
from app.api.cities import router as cities_router
from app.database import engine, Base
from app.models import CitySnapshot
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.api.predict import router as predict_router

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
app.include_router(cities_router)
app.include_router(predict_router)

scheduler = AsyncIOScheduler()

async def scheduled_refresh():
    from app.api.cities import refresh_cities
    print("Scheduled refresh triggered...")
    result = await refresh_cities()
    print(f"Refreshed {len(result['saved'])} cities | Failed: {len(result['failed'])}")

@app.on_event("startup")
async def startup():
    # Create DB tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables created")

    # Initial cache fill
    asyncio.create_task(initial_cache())

    # Schedule refresh every 30 minutes
    scheduler.add_job(
        scheduled_refresh,
        trigger=IntervalTrigger(minutes=30),
        id="city_refresh",
        name="Refresh city AQI & weather cache",
        replace_existing=True,
    )
    scheduler.start()
    print("Scheduler started — cities refresh every 30 minutes")

@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown()
    print("Scheduler stopped")

async def initial_cache():
    await asyncio.sleep(3)
    from app.api.cities import refresh_cities
    print("Initial city cache loading...")
    result = await refresh_cities()
    print(f"Initial cache done — {len(result['saved'])} cities loaded")

@app.get("/")
async def root():
    return {
        "message": "EarthPulse AI is running...",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "scheduler": scheduler.running,
        "next_refresh": str(scheduler.get_job("city_refresh").next_run_time)
    }