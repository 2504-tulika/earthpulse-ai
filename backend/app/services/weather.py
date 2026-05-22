import httpx
from app.config import settings

OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"
WAQI_BASE = "https://api.waqi.info"

async def get_weather(city: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{OPENWEATHER_BASE}/weather",
            params={
                "q": city,
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            }
        )
        response.raise_for_status()
        data = response.json()

        return {
            "city": data["name"],
            "country": data["sys"]["country"],
            "temperature": data["main"]["temp"],
            "feels_like": data["main"]["feels_like"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "weather": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "coordinates": {
                "lat": data["coord"]["lat"],
                "lon": data["coord"]["lon"]
            }
        }

async def get_aqi(city: str) -> dict:
    async with httpx.AsyncClient() as client:

        # Step 1: get coordinates from OpenWeather
        geo_response = await client.get(
            f"{OPENWEATHER_BASE}/weather",
            params={
                "q": city,
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            }
        )
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        lat = geo_data["coord"]["lat"]
        lon = geo_data["coord"]["lon"]
        city_name = geo_data["name"]

        # Step 2: use coordinates for AQI (much more reliable)
        aqi_response = await client.get(
            f"{WAQI_BASE}/feed/geo:{lat};{lon}/",
            params={"token": settings.WAQI_API_KEY}
        )
        aqi_response.raise_for_status()
        data = aqi_response.json()

        if data["status"] != "ok":
            return {"error": "AQI data not available for this city"}

        aqi = data["data"]["aqi"]
        return {
            "city": city_name,
            "coordinates": {"lat": lat, "lon": lon},
            "aqi": aqi,
            "level": get_aqi_level(aqi),
            "dominant_pollutant": data["data"].get("dominentpol", "unknown"),
            "pollutants": {
                k: v["v"]
                for k, v in data["data"].get("iaqi", {}).items()
            }
        }

async def get_city_summary(city: str) -> dict:
    async with httpx.AsyncClient() as client:

        # Get weather
        weather_response = await client.get(
            f"{OPENWEATHER_BASE}/weather",
            params={
                "q": city,
                "appid": settings.OPENWEATHER_API_KEY,
                "units": "metric"
            }
        )
        weather_response.raise_for_status()
        weather_data = weather_response.json()

        lat = weather_data["coord"]["lat"]
        lon = weather_data["coord"]["lon"]

        # Get AQI using coordinates
        aqi_response = await client.get(
            f"{WAQI_BASE}/feed/geo:{lat};{lon}/",
            params={"token": settings.WAQI_API_KEY}
        )
        aqi_response.raise_for_status()
        aqi_data = aqi_response.json()

        aqi_value = aqi_data["data"]["aqi"] if aqi_data["status"] == "ok" else None

        return {
            "city": weather_data["name"],
            "country": weather_data["sys"]["country"],
            "coordinates": {"lat": lat, "lon": lon},
            "weather": {
                "temperature": weather_data["main"]["temp"],
                "feels_like": weather_data["main"]["feels_like"],
                "humidity": weather_data["main"]["humidity"],
                "pressure": weather_data["main"]["pressure"],
                "description": weather_data["weather"][0]["description"],
                "wind_speed": weather_data["wind"]["speed"],
            },
            "aqi": {
                "value": aqi_value,
                "level": get_aqi_level(aqi_value) if aqi_value else "Unknown",
                "dominant_pollutant": aqi_data["data"].get("dominentpol", "unknown") if aqi_data["status"] == "ok" else "unknown",
            }
        }

def get_aqi_level(aqi: int) -> str:
    if aqi <= 50:   return "Good"
    if aqi <= 100:  return "Moderate"
    if aqi <= 150:  return "Unhealthy for Sensitive Groups"
    if aqi <= 200:  return "Unhealthy"
    if aqi <= 300:  return "Very Unhealthy"
    return "Hazardous"