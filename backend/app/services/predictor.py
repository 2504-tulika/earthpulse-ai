import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

MODEL_PATH = "app/ml_models/aqi_model.pkl"
SCALER_PATH = "app/ml_models/aqi_scaler.pkl"

def get_feature_vector(aqi, temperature, humidity, wind_speed, pressure, hour, day_of_week):
    """Build feature vector for prediction"""
    return np.array([[
        aqi,
        temperature,
        humidity,
        wind_speed,
        pressure,
        hour,
        day_of_week,
        np.sin(2 * np.pi * hour / 24),      # cyclic hour encoding
        np.cos(2 * np.pi * hour / 24),
        np.sin(2 * np.pi * day_of_week / 7), # cyclic day encoding
        np.cos(2 * np.pi * day_of_week / 7),
    ]])

def generate_training_data(
    base_aqi, temperature, humidity, wind_speed, pressure
):
    """
    Generate realistic synthetic training data based on current conditions.
    In production this would be historical data from a database.
    Uses domain knowledge about AQI patterns.
    """
    rows = []
    np.random.seed(42)

    for day in range(60):  # 60 days of hourly data
        for hour in range(24):
            dow = day % 7

            # AQI follows daily patterns — higher in morning/evening rush hours
            hour_factor = (
                1.3 if 7 <= hour <= 10 else   # morning rush
                1.2 if 17 <= hour <= 20 else  # evening rush
                0.8 if 2 <= hour <= 5 else    # late night — cleanest
                1.0
            )

            # Weekend effect — less traffic
            weekend_factor = 0.85 if dow >= 5 else 1.0

            # Wind reduces AQI
            wind_factor = max(0.6, 1 - (wind_speed * 0.04))

            # Humidity increases particulates
            humidity_factor = 1 + (humidity - 50) * 0.003

            # Seasonal drift over 60 days
            seasonal = 1 + 0.1 * np.sin(2 * np.pi * day / 30)

            aqi_val = (
                base_aqi
                * hour_factor
                * weekend_factor
                * wind_factor
                * humidity_factor
                * seasonal
                + np.random.normal(0, base_aqi * 0.08)  # noise
            )
            aqi_val = max(0, min(500, aqi_val))

            rows.append({
                "aqi": aqi_val,
                "temperature": temperature + np.random.normal(0, 3),
                "humidity": humidity + np.random.normal(0, 5),
                "wind_speed": wind_speed + np.random.normal(0, 0.5),
                "pressure": pressure + np.random.normal(0, 2),
                "hour": hour,
                "day_of_week": dow,
                "sin_hour": np.sin(2 * np.pi * hour / 24),
                "cos_hour": np.cos(2 * np.pi * hour / 24),
                "sin_dow": np.sin(2 * np.pi * dow / 7),
                "cos_dow": np.cos(2 * np.pi * dow / 7),
                "target_aqi": aqi_val * hour_factor * (1 + np.random.normal(0, 0.05)),
            })

    return pd.DataFrame(rows)

def train_model(base_aqi, temperature, humidity, wind_speed, pressure):
    """Train XGBoost model on generated data"""
    os.makedirs("app/ml_models", exist_ok=True)

    df = generate_training_data(base_aqi, temperature, humidity, wind_speed, pressure)

    features = ["aqi", "temperature", "humidity", "wind_speed", "pressure",
                "hour", "day_of_week", "sin_hour", "cos_hour", "sin_dow", "cos_dow"]
    X = df[features].values
    y = df["target_aqi"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = XGBRegressor(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    model.fit(X_scaled, y)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    return model, scaler

def predict_aqi(
    current_aqi, temperature, humidity,
    wind_speed, pressure, hours_ahead=72
):
    """Predict AQI for next N hours"""

    # Train fresh model based on current conditions
    model, scaler = train_model(
        current_aqi, temperature, humidity, wind_speed, pressure
    )

    now = datetime.now()
    predictions = []

    for h in range(1, hours_ahead + 1):
        future_time = now + timedelta(hours=h)
        hour = future_time.hour
        dow = future_time.weekday()

        features = get_feature_vector(
            current_aqi, temperature, humidity,
            wind_speed, pressure, hour, dow
        )
        features_scaled = scaler.transform(features)
        predicted = float(model.predict(features_scaled)[0])
        predicted = max(0, min(500, predicted))

        predictions.append({
            "hour": h,
            "datetime": future_time.strftime("%Y-%m-%d %H:%M"),
            "predicted_aqi": round(predicted, 1),
            "level": get_aqi_level(predicted),
            "color": get_aqi_color(predicted),
        })

    return predictions

def get_aqi_level(aqi):
    if aqi <= 50:   return "Good"
    if aqi <= 100:  return "Moderate"
    if aqi <= 150:  return "Unhealthy for Sensitive Groups"
    if aqi <= 200:  return "Unhealthy"
    if aqi <= 300:  return "Very Unhealthy"
    return "Hazardous"

def get_aqi_color(aqi):
    if aqi <= 50:   return "#34d399"
    if aqi <= 100:  return "#fbbf24"
    if aqi <= 150:  return "#f97316"
    if aqi <= 200:  return "#ef4444"
    if aqi <= 300:  return "#a855f7"
    return "#dc2626"