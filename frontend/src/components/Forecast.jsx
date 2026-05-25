import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { IconSearch, IconPin } from './icons'

const QUICK_CITIES = ['Delhi', 'Mumbai', 'London', 'Tokyo', 'New York', 'Dubai', 'Paris', 'Sydney']

function getAQIColor(aqi) {
  if (!aqi)       return '#94a3b8'
  if (aqi <= 50)  return '#34d399'
  if (aqi <= 100) return '#fbbf24'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#dc2626'
}

function getAQILevel(aqi) {
  if (!aqi)       return 'No data'
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const aqi = payload[0]?.value
  const color = getAQIColor(aqi)
  return (
    <div style={{
      background: 'rgba(11,17,32,0.95)',
      border: `1px solid ${color}40`,
      borderRadius: '10px', padding: '0.75rem 1rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      <p style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: '1.1rem' }}>AQI {Math.round(aqi)}</p>
      <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>{getAQILevel(aqi)}</p>
    </div>
  )
}

export default function Forecast() {
  const [city, setCity] = useState('')
  const [activeCity, setActiveCity] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [range, setRange] = useState(24)

  const fetchForecast = async (cityName) => {
    setLoading(true)
    setError(null)
    setData(null)
    setActiveCity(cityName)
    try {
      const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${BASE}/api/v1/predict/${cityName}?hours=72`)
      const json = await res.json()
      if (json.detail) throw new Error(json.detail)
      setData(json)
    } catch {
      setError('Forecast unavailable for this city. Try another.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (city.trim()) fetchForecast(city.trim())
  }

  const chartData = data?.predictions?.slice(0, range).map(p => ({
    time: p.datetime.split(' ')[1].slice(0, 5),
    date: p.datetime.split(' ')[0],
    aqi: p.predicted_aqi,
    level: p.level,
  }))

  const avgAqi = chartData
    ? Math.round(chartData.reduce((s, d) => s + d.aqi, 0) / chartData.length)
    : null

  const maxAqi = chartData
    ? Math.round(Math.max(...chartData.map(d => d.aqi)))
    : null

  const minAqi = chartData
    ? Math.round(Math.min(...chartData.map(d => d.aqi)))
    : null

  const dominantColor = avgAqi ? getAQIColor(avgAqi) : '#38bdf8'

  // Find peak hours
  const peakHours = chartData
    ? chartData
        .filter(d => d.aqi > (avgAqi * 1.1))
        .slice(0, 3)
        .map(d => d.time)
    : []

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.3px',
          background: 'linear-gradient(90deg, #38bdf8, #34d399)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.3rem',
        }}>
          72h AQI Forecast
        </h2>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          XGBoost ML predictions — hourly air quality forecast for any city
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex', gap: '0.625rem', marginBottom: '1rem',
      }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '0 1rem',
        }}>
          <span style={{ color: '#475569', display: 'flex' }}><IconSearch /></span>
          <input
            type="text" value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Search city for forecast — Delhi, Paris, Sydney..."
            style={{
              flex: 1, padding: '0.8rem 0', background: 'transparent',
              border: 'none', color: '#e2e8f0', fontSize: '0.9rem',
              outline: 'none', fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
        <button type="submit" disabled={loading} style={{
          padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none',
          background: loading ? '#1e293b' : 'linear-gradient(90deg, #38bdf8, #34d399)',
          color: loading ? '#475569' : '#0b1120',
          fontWeight: 600, fontSize: '0.875rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
        }}>
          {loading ? 'Predicting...' : 'Get Forecast'}
        </button>
      </form>

      {/* Quick cities */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {QUICK_CITIES.map(c => (
          <button key={c} onClick={() => { setCity(c); fetchForecast(c) }} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '5px 12px', borderRadius: '20px', border: '1px solid',
            borderColor: activeCity === c ? '#38bdf8' : 'rgba(255,255,255,0.06)',
            background: activeCity === c ? 'rgba(56,189,248,0.1)' : 'transparent',
            color: activeCity === c ? '#38bdf8' : '#475569',
            fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            <span style={{ color: 'inherit', display: 'flex' }}><IconPin /></span>
            {c}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px', padding: '0.875rem 1rem',
          color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem',
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{
            width: '32px', height: '32px',
            border: '2px solid rgba(255,255,255,0.05)',
            borderTop: '2px solid #38bdf8',
            borderRadius: '50%', margin: '0 auto 1rem',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#475569', fontSize: '0.875rem' }}>Running ML prediction model...</p>
        </div>
      )}

      {/* Forecast result */}
      {data && !loading && (
        <div style={{ animation: 'fadeSlideIn 0.4s ease' }}>
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* City + stats row */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '1.25rem',
            marginBottom: '1rem',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem',
              marginBottom: '1.25rem',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <IconPin />{data.country}
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                  {data.city}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px' }}>
                  XGBoost · {range}h forecast · Powered by EarthPulse ML
                </p>
              </div>

              {/* Range toggle */}
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                {[24, 48, 72].map(h => (
                  <button key={h} onClick={() => setRange(h)} style={{
                    padding: '6px 14px', borderRadius: '8px', border: '1px solid',
                    borderColor: range === h ? dominantColor : 'rgba(255,255,255,0.08)',
                    background: range === h ? `${dominantColor}15` : 'transparent',
                    color: range === h ? dominantColor : '#475569',
                    fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '0.75rem',
            }}>
              {[
                { label: 'Current AQI', value: data.current_aqi, color: getAQIColor(data.current_aqi) },
                { label: `Avg ${range}h`, value: avgAqi, color: dominantColor },
                { label: 'Peak AQI', value: maxAqi, color: getAQIColor(maxAqi) },
                { label: 'Best AQI', value: minAqi, color: getAQIColor(minAqi) },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: `${color}08`,
                  border: `1px solid ${color}20`,
                  borderRadius: '12px', padding: '0.875rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '4px' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '1.25rem',
            marginBottom: '1rem',
          }}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={dominantColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={dominantColor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
                  tickLine={false} axisLine={false}
                  interval={range === 24 ? 3 : range === 48 ? 7 : 11}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
                  tickLine={false} axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={50}  stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={100} stroke="#fbbf24" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.3} />
                <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.3} />
                <Area
                  type="monotone" dataKey="aqi"
                  stroke={dominantColor} strokeWidth={2}
                  fill="url(#forecastGradient)" dot={false}
                  activeDot={{ r: 4, fill: dominantColor, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Peak hours + recommendation */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '1rem',
            }}>
              <p style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.75rem' }}>
                Peak Pollution Hours
              </p>
              {peakHours.length > 0 ? peakHours.map(h => (
                <div key={h} style={{
                  display: 'inline-block', marginRight: '0.5rem', marginBottom: '0.5rem',
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '8px', padding: '4px 12px',
                  fontSize: '0.85rem', fontWeight: 600, color: '#ef4444',
                }}>
                  {h}
                </div>
              )) : (
                <p style={{ color: '#334155', fontSize: '0.8rem' }}>No significant peaks detected</p>
              )}
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '1rem',
            }}>
              <p style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '0.75rem' }}>
                Recommendation
              </p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                {avgAqi <= 50
                  ? 'Air quality will be good. Safe for all outdoor activities.'
                  : avgAqi <= 100
                  ? 'Moderate air quality expected. Sensitive groups should limit prolonged exposure.'
                  : avgAqi <= 150
                  ? 'Unhealthy for sensitive groups. Reduce outdoor activity during peak hours.'
                  : avgAqi <= 200
                  ? 'Unhealthy conditions expected. Limit outdoor exertion and wear a mask.'
                  : 'Very unhealthy forecast. Avoid outdoor activities. Keep windows closed.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          border: '1px dashed rgba(255,255,255,0.05)',
          borderRadius: '16px',
        }}>
          <p style={{ color: '#334155', fontSize: '0.875rem' }}>
            Search a city above to see its 72h AQI forecast
          </p>
        </div>
      )}
    </div>
  )
}