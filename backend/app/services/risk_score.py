def calculate_risk_score(
    aqi: int,
    temperature: float,
    humidity: float,
    dominant_pollutant: str,
) -> dict:
    """
    EarthPulse Risk Score — composite environmental risk index.
    Scores each dimension 0-100, then weighs them into a final score.
    """

    # --- AQI Score (40% weight) ---
    if aqi <= 50:    aqi_score = (aqi / 50) * 20
    elif aqi <= 100: aqi_score = 20 + ((aqi - 50) / 50) * 20
    elif aqi <= 150: aqi_score = 40 + ((aqi - 100) / 50) * 20
    elif aqi <= 200: aqi_score = 60 + ((aqi - 150) / 50) * 15
    elif aqi <= 300: aqi_score = 75 + ((aqi - 200) / 100) * 15
    else:            aqi_score = 90 + min((aqi - 300) / 200 * 10, 10)
    aqi_score = min(100, aqi_score)

    # --- Heat Stress Score (25% weight) ---
    if temperature <= 10:   heat_score = 30
    elif temperature <= 20: heat_score = 10
    elif temperature <= 25: heat_score = 15
    elif temperature <= 30: heat_score = 30
    elif temperature <= 35: heat_score = 55
    elif temperature <= 40: heat_score = 75
    elif temperature <= 45: heat_score = 90
    else:                   heat_score = 100

    # --- Humidity Stress Score (15% weight) ---
    if humidity < 20:       humidity_score = 60   # too dry
    elif humidity <= 40:    humidity_score = 20   # comfortable
    elif humidity <= 60:    humidity_score = 30   # moderate
    elif humidity <= 75:    humidity_score = 50   # uncomfortable
    elif humidity <= 85:    humidity_score = 70   # very humid
    else:                   humidity_score = 85   # oppressive

    # --- Pollutant Danger Score (20% weight) ---
    pollutant_danger = {
        "pm25": 90,   # most dangerous — deep lung penetration
        "pm10": 70,   # dangerous — respiratory issues
        "no2":  75,   # toxic gas
        "so2":  80,   # acid rain precursor
        "co":   85,   # carbon monoxide — deadly
        "o3":   65,   # ozone — respiratory irritant
    }
    pollutant_score = pollutant_danger.get(
        dominant_pollutant.lower() if dominant_pollutant else "pm25", 50
    )

    # --- Composite Score ---
    final_score = (
        aqi_score      * 0.40 +
        heat_score     * 0.25 +
        humidity_score * 0.15 +
        pollutant_score * 0.20
    )
    final_score = round(min(100, max(0, final_score)), 1)

    # --- Risk Level ---
    if final_score <= 20:   level = "Very Low"
    elif final_score <= 40: level = "Low"
    elif final_score <= 55: level = "Moderate"
    elif final_score <= 70: level = "High"
    elif final_score <= 85: level = "Very High"
    else:                   level = "Extreme"

    # --- Color ---
    if final_score <= 20:   color = "#34d399"
    elif final_score <= 40: color = "#a3e635"
    elif final_score <= 55: color = "#fbbf24"
    elif final_score <= 70: color = "#f97316"
    elif final_score <= 85: color = "#ef4444"
    else:                   color = "#dc2626"

    return {
        "score": final_score,
        "level": level,
        "color": color,
        "breakdown": {
            "aqi_score":       round(aqi_score, 1),
            "heat_score":      round(heat_score, 1),
            "humidity_score":  round(humidity_score, 1),
            "pollutant_score": pollutant_score,
        },
        "weights": {
            "aqi": "40%",
            "heat": "25%",
            "humidity": "15%",
            "pollutant": "20%",
        }
    }