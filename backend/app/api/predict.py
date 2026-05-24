from fastapi import APIRouter, HTTPException
from app.services.weather import get_city_summary
from app.services.predictor import predict_aqi

router = APIRouter(prefix="/api/v1", tags=["ML Predictions"])

@router.get("/predict/{city}")
async def predict_city_aqi(city: str, hours: int = 72):
    """
    Predict AQI for a city for the next N hours (default 72).
    Uses XGBoost trained on current environmental conditions.
    """
    try:
        # Get current city data
        data = await get_city_summary(city)

        current_aqi = data["aqi"]["value"]
        temperature = data["weather"]["temperature"]
        humidity = data["weather"]["humidity"]
        wind_speed = data["weather"]["wind_speed"]
        pressure = data["weather"]["pressure"]

        if not current_aqi:
            raise HTTPException(
                status_code=400,
                detail="No AQI data available for this city"
            )

        # Run ML prediction
        predictions = predict_aqi(
            current_aqi=current_aqi,
            temperature=temperature,
            humidity=humidity,
            wind_speed=wind_speed,
            pressure=pressure,
            hours_ahead=min(hours, 72),
        )

        return {
            "city": data["city"],
            "country": data["country"],
            "current_aqi": current_aqi,
            "current_level": data["aqi"]["level"],
            "predictions": predictions,
            "model": "XGBoost",
            "features": ["aqi", "temperature", "humidity", "wind_speed", "pressure", "hour", "day_of_week"],
            "hours_predicted": len(predictions),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))