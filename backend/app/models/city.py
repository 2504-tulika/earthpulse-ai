from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class CitySnapshot(Base):
    __tablename__ = "city_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, index=True)
    country = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    weather_description = Column(String)
    aqi = Column(Integer)
    aqi_level = Column(String)
    dominant_pollutant = Column(String)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())