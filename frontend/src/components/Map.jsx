import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { getCitySummary } from '../services/api'
import { IconSearch } from './icons'

const DEFAULT_CITIES = [
  { name: 'Delhi',     lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai',    lat: 19.0760, lon: 72.8777 },
  { name: 'Kolkata',   lat: 22.5726, lon: 88.3639 },
  { name: 'London',    lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo',     lat: 35.6762, lon: 139.6503 },
  { name: 'Paris',     lat: 48.8566, lon: 2.3522  },
  { name: 'Beijing',   lat: 39.9042, lon: 116.4074 },
  { name: 'Sydney',    lat: -33.8688, lon: 151.2093 },
  { name: 'New York',  lat: 40.7128, lon: -74.0060 },
  { name: 'Dubai',     lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', lat: 1.3521,  lon: 103.8198 },
  { name: 'Cairo',     lat: 30.0444, lon: 31.2357 },
]

function getAQIColor(aqi) {
  if (!aqi)       return '#64748b'
  if (aqi <= 50)  return '#34d399'
  if (aqi <= 100) return '#fbbf24'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#dc2626'
}

function getAQILabel(aqi) {
  if (!aqi)       return 'No data'
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy (Sensitive)'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

// Component to fly map to a location
function FlyTo({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, 8, { duration: 1.5 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [coords])
  return null
}

export default function MapView() {
  const [cityData, setCityData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCity, setSearchCity] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [flyCoords, setFlyCoords] = useState(null)
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Try cache first — instant!
        const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
        const res = await fetch(`${BASE}/api/v1/cities/snapshot`)
        const json = await res.json()

        if (json.cached && json.cities.length > 0) {
          // Map cached data to our format
          const mapped = json.cities.map(c => ({
            name: c.city,
            lat: c.lat,
            lon: c.lon,
            data: {
              city: c.city,
              country: c.country,
              coordinates: { lat: c.lat, lon: c.lon },
              weather: { temperature: c.temperature, humidity: c.humidity },
              aqi: { value: c.aqi, level: c.aqi_level, dominant_pollutant: c.dominant_pollutant }
            }
          }))
          setCityData(mapped)
          setLoading(false)
          return
        }
      } catch {
        console.log('Cache miss, fetching live...')
      }

      // Fallback: fetch live one by one
      const results = []
      for (const city of DEFAULT_CITIES) {
        try {
          const res = await getCitySummary(city.name)
          results.push({ ...city, data: res.data })
        } catch {
          results.push({ ...city, data: null })
        }
        await new Promise(r => setTimeout(r, 300))
      }
      setCityData(results)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const handleMapSearch = async (e) => {
    e.preventDefault()
    if (!searchCity.trim()) return
    setSearchLoading(true)
    setSearchError('')
    try {
      const res = await getCitySummary(searchCity.trim())
      const data = res.data
      const coords = [data.coordinates?.lat, data.coordinates?.lon]
      setFlyCoords(coords)
      // Add to map markers if not already there
      setCityData(prev => {
        const exists = prev.find(c => c.name.toLowerCase() === data.city.toLowerCase())
        if (exists) return prev
        return [...prev, { name: data.city, lat: coords[0], lon: coords[1], data }]
      })
    } catch {
      setSearchError('City not found. Try another name.')
    } finally {
      setSearchLoading(false)
    }
  }

  const allMarkers = cityData

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.3px',
          background: 'linear-gradient(90deg, #38bdf8, #34d399)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.3rem',
        }}>
          Global AQI Map
        </h2>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          Live air quality across major cities — search any city or click a marker
        </p>
      </div>

      {/* Map Search bar */}
      <form onSubmit={handleMapSearch} style={{
        display: 'flex', gap: '0.625rem', marginBottom: '1rem',
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '0 1rem',
          backdropFilter: 'blur(10px)',
        }}>
          <span style={{ color: '#475569', display: 'flex' }}><IconSearch /></span>
          <input
            type="text"
            value={searchCity}
            onChange={e => setSearchCity(e.target.value)}
            placeholder="Search city on map — Bengaluru, Berlin, Toronto..."
            style={{
              flex: 1, padding: '0.75rem 0', background: 'transparent',
              border: 'none', color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
              fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
        <button type="submit" disabled={searchLoading} style={{
          padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(90deg, #38bdf8, #34d399)',
          color: '#0b1120', fontWeight: 600, fontSize: '0.85rem',
          cursor: searchLoading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
        }}>
          {searchLoading ? 'Searching...' : 'Find on Map'}
        </button>
      </form>

      {searchError && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '10px', padding: '0.625rem 1rem',
          color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem',
        }}>
          {searchError}
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {[
          { label: 'Good',          color: '#34d399' },
          { label: 'Moderate',      color: '#fbbf24' },
          { label: 'Sensitive',     color: '#f97316' },
          { label: 'Unhealthy',     color: '#ef4444' },
          { label: 'Very Unhealthy',color: '#a855f7' },
          { label: 'Hazardous',     color: '#dc2626' },
          { label: 'No data',       color: '#64748b' },
        ].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}80` }} />
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#475569', fontSize: '0.875rem' }}>
          <div style={{
            width: '28px', height: '28px',
            border: '2px solid rgba(255,255,255,0.05)',
            borderTop: '2px solid #38bdf8',
            borderRadius: '50%', margin: '0 auto 0.75rem',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Loading city data...
        </div>
      )}

      {/* Map */}
      {!loading && (
        <div style={{
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 0 60px rgba(56,189,248,0.05)',
        }}>
          <MapContainer
            center={[25, 15]}
            zoom={2}
            style={{ height: '520px', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            {flyCoords && <FlyTo coords={flyCoords} />}

            {allMarkers.map((city) => {
              const aqi = city.data?.aqi?.value
              const color = getAQIColor(aqi)
              const radius = aqi ? Math.max(10, Math.min(aqi / 7, 22)) : 10
              return (
                <CircleMarker
                  key={city.name}
                  center={[city.lat, city.lon]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div style={{
                      background: '#1e293b', borderRadius: '12px',
                      padding: '0.875rem', minWidth: '170px',
                      fontFamily: 'Inter, sans-serif',
                      border: `1px solid ${color}30`,
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '8px' }}>
                        {city.name}
                      </div>
                      {aqi ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>AQI</span>
                            <span style={{ color, fontWeight: 700, fontSize: '1rem' }}>{aqi}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Status</span>
                            <span style={{ color, fontSize: '0.73rem', fontWeight: 600 }}>{getAQILabel(aqi)}</span>
                          </div>
                          {city.data?.weather && (
                            <>
                              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Temp</span>
                                <span style={{ color: '#e2e8f0', fontSize: '0.78rem' }}>{city.data.weather.temperature}°C</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Humidity</span>
                                <span style={{ color: '#e2e8f0', fontSize: '0.78rem' }}>{city.data.weather.humidity}%</span>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div style={{ color: '#475569', fontSize: '0.78rem' }}>No AQI station nearby</div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>
        </div>
      )}

      <p style={{ color: '#1e293b', fontSize: '0.72rem', marginTop: '0.5rem', textAlign: 'right' }}>
        Markers sized by AQI intensity · Data from WAQI & OpenWeatherMap
      </p>
    </div>
  )
}