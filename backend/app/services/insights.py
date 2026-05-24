from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_city_insight(city_data: dict) -> str:
    city = city_data["city"]
    country = city_data["country"]
    weather = city_data["weather"]
    aqi = city_data["aqi"]
    risk = city_data["risk_score"]

    prompt = f"""You are an environmental intelligence analyst for EarthPulse AI.
Based on the following real-time data for {city}, {country}, write a concise 3-4 sentence insight paragraph for general public consumption.

Current Data:
- AQI: {aqi["value"]} ({aqi["level"]})
- Dominant Pollutant: {aqi["dominant_pollutant"].upper()}
- Temperature: {weather["temperature"]}°C (Feels like {weather["feels_like"]}°C)
- Humidity: {weather["humidity"]}%
- Wind Speed: {weather["wind_speed"]} m/s
- Weather: {weather["description"]}
- EarthPulse Risk Score: {risk["score"]}/100 ({risk["level"]} Risk)

Instructions:
- Explain what the AQI level means for residents in plain language
- Mention how current weather conditions are affecting air quality
- Give a specific health recommendation based on the risk level
- Keep it under 80 words, factual and clear
- Write as a flowing paragraph, no bullet points
- Do NOT start with "Currently" or "The city of"
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are an environmental analyst. Write concise, factual, helpful insights about air quality and environmental conditions."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_tokens=150,
        temperature=0.7,
    )

    return response.choices[0].message.content.strip()