from fastapi import APIRouter, HTTPException
from app.services.weather import get_city_summary
from app.database import AsyncSessionLocal
from app.models.city import CitySnapshot
from sqlalchemy import select, func
import asyncio

router = APIRouter(prefix="/api/v1", tags=["Cities"])

DEFAULT_CITIES = [
    "Delhi", "Mumbai", "Kolkata", "London", "Tokyo",
    "Paris", "Beijing", "Sydney", "New York", "Dubai",
    "Singapore", "Cairo"
]

@router.get("/cities/snapshot")
async def get_cities_snapshot():
    """Return cached city data from DB — fast!"""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(CitySnapshot)
            .distinct(CitySnapshot.city)
            .order_by(CitySnapshot.city, CitySnapshot.recorded_at.desc())
        )
        snapshots = result.scalars().all()

        if not snapshots:
            return {"cities": [], "cached": False}

        return {
            "cities": [
                {
                    "city": s.city,
                    "country": s.country,
                    "lat": s.lat,
                    "lon": s.lon,
                    "aqi": s.aqi,
                    "aqi_level": s.aqi_level,
                    "dominant_pollutant": s.dominant_pollutant,
                    "temperature": s.temperature,
                    "humidity": s.humidity,
                    "recorded_at": s.recorded_at.isoformat() if s.recorded_at else None,
                }
                for s in snapshots
            ],
            "cached": True,
            "count": len(snapshots)
        }

@router.post("/cities/refresh")
async def refresh_cities():
    """Fetch fresh data for all default cities and store in DB"""
    saved = []
    failed = []

    for city_name in DEFAULT_CITIES:
        try:
            data = await get_city_summary(city_name)
            async with AsyncSessionLocal() as session:
                snapshot = CitySnapshot(
                    city=data["city"],
                    country=data["country"],
                    lat=data["coordinates"]["lat"],
                    lon=data["coordinates"]["lon"],
                    temperature=data["weather"]["temperature"],
                    humidity=data["weather"]["humidity"],
                    wind_speed=data["weather"]["wind_speed"],
                    weather_description=data["weather"]["description"],
                    aqi=data["aqi"]["value"],
                    aqi_level=data["aqi"]["level"],
                    dominant_pollutant=data["aqi"]["dominant_pollutant"],
                )
                session.add(snapshot)
                await session.commit()
                saved.append(city_name)
            await asyncio.sleep(0.3)
        except Exception as e:
            failed.append({"city": city_name, "error": str(e)})

    return {"saved": saved, "failed": failed}