import { useState } from 'react'
import { getCitySummary } from '../services/api'
import { IconSearch, IconPin } from './icons'

const AQI_CONFIG = {
  'Good':                           { color: '#34d399' },
  'Moderate':                       { color: '#fbbf24' },
  'Unhealthy for Sensitive Groups': { color: '#f97316' },
  'Unhealthy':                      { color: '#ef4444' },
  'Very Unhealthy':                 { color: '#a855f7' },
  'Hazardous':                      { color: '#dc2626' },
}

function getAQIColor(level) {
  return AQI_CONFIG[level]?.color ?? '#94a3b8'
}

const QUICK_CITIES = ['Delhi', 'Mumbai', 'London', 'Tokyo', 'New York', 'Dubai', 'Paris', 'Sydney']

function CitySelector({ label, onSelect, selected, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) onSelect(input.trim())
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px', padding: '1.25rem',
      flex: 1, minWidth: '240px',
    }}>
      <p style={{
        fontSize: '0.75rem', color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.8px',
        fontWeight: 600, marginBottom: '0.875rem',
      }}>
        {label}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', padding: '0 0.75rem',
        }}>
          <span style={{ color: '#475569', display: 'flex' }}><IconSearch /></span>
          <input
            type="text" value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="City name..."
            style={{
              flex: 1, padding: '0.625rem 0', background: 'transparent',
              border: 'none', color: '#e2e8f0', fontSize: '0.85rem',
              outline: 'none', fontFamily: 'Inter, sans-serif',
            }}
          />
        </div>
        <button type="submit" disabled={loading} style={{
          padding: '0.625rem 1rem', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(90deg, #38bdf8, #34d399)',
          color: '#0b1120', fontWeight: 600, fontSize: '0.8rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}>
          {loading ? '...' : 'Go'}
        </button>
      </form>

      {/* Quick picks */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {QUICK_CITIES.map(city => (
          <button key={city} onClick={() => { setInput(city); onSelect(city) }} style={{
            padding: '3px 10px', borderRadius: '12px', border: '1px solid',
            borderColor: selected?.city === city ? '#38bdf8' : 'rgba(255,255,255,0.06)',
            background: selected?.city === city ? 'rgba(56,189,248,0.1)' : 'transparent',
            color: selected?.city === city ? '#38bdf8' : '#475569',
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}>
            {city}
          </button>
        ))}
      </div>
    </div>
  )
}

function MetricRow({ label, val1, val2, unit, higherIsBetter = false }) {
  if (!val1 || !val2) return null
  const n1 = parseFloat(val1)
  const n2 = parseFloat(val2)
  const city1Better = higherIsBetter ? n1 >= n2 : n1 <= n2
  const city2Better = higherIsBetter ? n2 >= n1 : n2 <= n1
  const tie = n1 === n2

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center', gap: '1rem',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          fontSize: '1rem', fontWeight: 700,
          color: !tie && city1Better ? '#34d399' : '#e2e8f0',
        }}>
          {val1}{unit}
        </span>
        {!tie && city1Better && (
          <span style={{ fontSize: '0.65rem', color: '#34d399', marginLeft: '4px' }}>✓</span>
        )}
      </div>
      <div style={{
        fontSize: '0.72rem', color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        textAlign: 'center', minWidth: '80px',
      }}>
        {label}
      </div>
      <div>
        <span style={{
          fontSize: '1rem', fontWeight: 700,
          color: !tie && city2Better ? '#34d399' : '#e2e8f0',
        }}>
          {val2}{unit}
        </span>
        {!tie && city2Better && (
          <span style={{ fontSize: '0.65rem', color: '#34d399', marginLeft: '4px' }}>✓</span>
        )}
      </div>
    </div>
  )
}

export default function Compare() {
  const [city1, setCity1] = useState(null)
  const [city2, setCity2] = useState(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error1, setError1] = useState(null)
  const [error2, setError2] = useState(null)

  const fetchCity1 = async (name) => {
    setLoading1(true); setError1(null)
    try {
      const res = await getCitySummary(name)
      setCity1(res.data)
    } catch { setError1('City not found') }
    finally { setLoading1(false) }
  }

  const fetchCity2 = async (name) => {
    setLoading2(true); setError2(null)
    try {
      const res = await getCitySummary(name)
      setCity2(res.data)
    } catch { setError2('City not found') }
    finally { setLoading2(false) }
  }

  const bothLoaded = city1 && city2

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
          City Comparison
        </h2>
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>
          Compare air quality, weather & risk scores side by side
        </p>
      </div>

      {/* City selectors */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <CitySelector label="City A" onSelect={fetchCity1} selected={city1} loading={loading1} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', color: '#334155', padding: '0.5rem',
          fontWeight: 700,
        }}>vs</div>
        <CitySelector label="City B" onSelect={fetchCity2} selected={city2} loading={loading2} />
      </div>

      {/* Errors */}
      {(error1 || error2) && (
        <div style={{
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px', padding: '0.75rem 1rem',
          color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem',
        }}>
          {error1 || error2}
        </div>
      )}

      {/* Loading */}
      {(loading1 || loading2) && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.875rem' }}>
          <div style={{
            width: '28px', height: '28px',
            border: '2px solid rgba(255,255,255,0.05)',
            borderTop: '2px solid #38bdf8',
            borderRadius: '50%', margin: '0 auto 0.75rem',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Fetching city data...
        </div>
      )}

      {/* Comparison table */}
      {bothLoaded && (
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px', overflow: 'hidden',
          animation: 'fadeSlideIn 0.4s ease',
        }}>
          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(12px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* City headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem', padding: '1.5rem',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* City 1 */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', color: '#475569', fontSize: '0.75rem', marginBottom: '4px' }}>
                <IconPin />{city1.country}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                {city1.city}
              </h3>
              <div style={{
                display: 'inline-block', marginTop: '6px',
                background: `${getAQIColor(city1.aqi?.level)}15`,
                border: `1px solid ${getAQIColor(city1.aqi?.level)}30`,
                borderRadius: '8px', padding: '4px 12px',
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: getAQIColor(city1.aqi?.level) }}>
                  {city1.aqi?.value}
                </span>
                <span style={{ fontSize: '0.65rem', color: getAQIColor(city1.aqi?.level), marginLeft: '4px' }}>AQI</span>
              </div>
            </div>

            {/* VS */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: '#334155',
            }}>VS</div>

            {/* City 2 */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', fontSize: '0.75rem', marginBottom: '4px' }}>
                <IconPin />{city2.country}
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
                {city2.city}
              </h3>
              <div style={{
                display: 'inline-block', marginTop: '6px',
                background: `${getAQIColor(city2.aqi?.level)}15`,
                border: `1px solid ${getAQIColor(city2.aqi?.level)}30`,
                borderRadius: '8px', padding: '4px 12px',
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: getAQIColor(city2.aqi?.level) }}>
                  {city2.aqi?.value}
                </span>
                <span style={{ fontSize: '0.65rem', color: getAQIColor(city2.aqi?.level), marginLeft: '4px' }}>AQI</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ padding: '0.5rem 1.5rem 1rem' }}>
            <MetricRow
              label="Temperature"
              val1={city1.weather?.temperature} val2={city2.weather?.temperature}
              unit="°C" higherIsBetter={false}
            />
            <MetricRow
              label="Feels Like"
              val1={city1.weather?.feels_like} val2={city2.weather?.feels_like}
              unit="°C" higherIsBetter={false}
            />
            <MetricRow
              label="Humidity"
              val1={city1.weather?.humidity} val2={city2.weather?.humidity}
              unit="%" higherIsBetter={false}
            />
            <MetricRow
              label="Wind Speed"
              val1={city1.weather?.wind_speed} val2={city2.weather?.wind_speed}
              unit=" m/s" higherIsBetter={true}
            />
            <MetricRow
              label="Pressure"
              val1={city1.weather?.pressure} val2={city2.weather?.pressure}
              unit=" hPa" higherIsBetter={false}
            />
            <MetricRow
              label="Risk Score"
              val1={city1.risk_score?.score} val2={city2.risk_score?.score}
              unit="/100" higherIsBetter={false}
            />
          </div>

          {/* Winner banner */}
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            {(() => {
              const r1 = city1.risk_score?.score ?? 100
              const r2 = city2.risk_score?.score ?? 100
              const winner = r1 < r2 ? city1.city : r2 < r1 ? city2.city : null
              const color = '#34d399'
              if (!winner) return (
                <div style={{
                  textAlign: 'center', padding: '0.75rem',
                  background: 'rgba(56,189,248,0.06)',
                  border: '1px solid rgba(56,189,248,0.15)',
                  borderRadius: '10px', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600,
                }}>
                  Both cities have equal environmental risk
                </div>
              )
              return (
                <div style={{
                  textAlign: 'center', padding: '0.75rem',
                  background: `${color}08`,
                  border: `1px solid ${color}20`,
                  borderRadius: '10px', color, fontSize: '0.85rem', fontWeight: 600,
                }}>
                  {winner} has better environmental conditions today
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!bothLoaded && !loading1 && !loading2 && (
        <div style={{
          textAlign: 'center', padding: '3rem 2rem',
          border: '1px dashed rgba(255,255,255,0.05)',
          borderRadius: '16px',
        }}>
          <p style={{ color: '#334155', fontSize: '0.875rem' }}>
            Select two cities above to compare their environmental data
          </p>
        </div>
      )}
    </div>
  )
}