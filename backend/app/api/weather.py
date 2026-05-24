from fastapi import APIRouter, HTTPException
from app.services.weather import get_weather, get_aqi, get_city_summary
from app.services.risk_score import calculate_risk_score

router = APIRouter(prefix="/api/v1", tags=["Weather & AQI"])

@router.get("/weather/{city}")
async def weather(city: str):
    try:
        return await get_weather(city)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/aqi/{city}")
async def aqi(city: str):
    try:
        return await get_aqi(city)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/city/{city}")
async def city(city: str):
    try:
        return await get_city_summary(city)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/risk/{city}")
async def city_risk(city: str):
    try:
        data = await get_city_summary(city)
        return {
            "city": data["city"],
            "country": data["country"],
            "risk_score": data["risk_score"],
            "aqi": data["aqi"],
            "weather": data["weather"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

