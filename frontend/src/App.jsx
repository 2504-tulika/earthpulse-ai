import { useState } from 'react'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import CityCard from './components/CityCard'
import InsightCard from './components/InsightCard'
import RiskScore from './components/RiskScore'
import ForecastChart from './components/ForecastChart'
import MapView from './components/Map'
import { getCitySummary } from './services/api'
import { IconPin, IconSearch } from './components/icons'

const QUICK_CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'London', 'Tokyo', 'New York']
const CITY_TABS = ['Overview', 'AI Insight', 'Risk Score', 'Forecast']

export default function App() {
  const [cityData, setCityData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeCity, setActiveCity] = useState(null)
  const [view, setView] = useState('dashboard')
  const [cityTab, setCityTab] = useState('Overview')

  const handleSearch = async (city) => {
    setLoading(true)
    setError(null)
    setCityData(null)
    setActiveCity(city)
    setView('dashboard')
    setCityTab('Overview')
    try {
      const res = await getCitySummary(city)
      setCityData(res.data)
    } catch {
      setError('City not found or service unavailable. Try Delhi or Mumbai.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar view={view} setView={setView} />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.25rem' }}>

        {/* MAP VIEW */}
        {view === 'map' && <MapView />}

        {/* COMPARE VIEW */}
        {view === 'compare' && <ComparePlaceholder />}

        {/* FORECAST VIEW */}
        {view === 'forecast' && <ForecastPlaceholder />}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && (
          <>
            {/* Hero */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: '20px', padding: '4px 12px',
                fontSize: '0.72rem', color: '#38bdf8',
                fontWeight: 500, marginBottom: '1rem', letterSpacing: '0.3px',
              }}>
                Live Environmental Intelligence
              </div>
              <h1 style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                fontWeight: 800, letterSpacing: '-1px',
                lineHeight: 1.1, marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Environmental<br />
                <span style={{
                  background: 'linear-gradient(90deg, #38bdf8, #34d399)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Intelligence</span>
              </h1>
              <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Real-time air quality, weather & risk data for cities worldwide.
              </p>
            </div>

            <SearchBar onSearch={handleSearch} loading={loading} />

            {/* Quick chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {QUICK_CITIES.map(city => (
                <button key={city} onClick={() => handleSearch(city)} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 14px', borderRadius: '20px', border: '1px solid',
                  borderColor: activeCity === city ? '#38bdf8' : 'rgba(255,255,255,0.06)',
                  background: activeCity === city ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)',
                  color: activeCity === city ? '#38bdf8' : '#475569',
                  fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  fontWeight: activeCity === city ? 500 : 400,
                }}>
                  <span style={{ color: 'inherit', display: 'flex' }}><IconPin /></span>
                  {city}
                </button>
              ))}
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <div style={{
                  width: '36px', height: '36px',
                  border: '2px solid rgba(255,255,255,0.05)',
                  borderTop: '2px solid #38bdf8',
                  borderRadius: '50%', margin: '0 auto 1rem',
                  animation: 'spin 0.8s linear infinite',
                }} />
                <p style={{ color: '#334155', fontSize: '0.875rem' }}>
                  Fetching live environmental data...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '12px', padding: '0.875rem 1rem',
                color: '#f87171', fontSize: '0.875rem',
              }}>
                {error}
              </div>
            )}

            {/* City result */}
            {cityData && !loading && (
              <>
                {/* City header */}
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '20px', overflow: 'hidden',
                  marginBottom: '0',
                  animation: 'fadeSlideIn 0.4s ease',
                }}>
                  <style>{`
                    @keyframes fadeSlideIn {
                      from { opacity: 0; transform: translateY(12px); }
                      to   { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>

                  {/* Top accent */}
                  <div style={{
                    height: '3px',
                    background: `linear-gradient(90deg, ${cityData.risk_score?.color ?? '#38bdf8'}, #38bdf8, #10b981)`
                  }} />

                  <div style={{ padding: '1.5rem 1.5rem 0' }}>
                    {/* City name + AQI */}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: '1.25rem',
                      flexWrap: 'wrap', gap: '1rem',
                    }}>
                      <div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          marginBottom: '6px', color: '#475569', fontSize: '0.78rem',
                        }}>
                          <IconPin />
                          <span>{cityData.country}</span>
                        </div>
                        <h2 style={{
                          fontSize: '2rem', fontWeight: 800,
                          color: '#f1f5f9', letterSpacing: '-0.8px', lineHeight: 1,
                        }}>
                          {cityData.city}
                        </h2>
                        <p style={{
                          fontSize: '0.8rem', color: '#475569',
                          marginTop: '4px', textTransform: 'capitalize',
                        }}>
                          {cityData.weather?.description} · updated just now
                        </p>
                      </div>

                      {/* AQI badge */}
                      <div style={{
                        background: `${cityData.risk_score?.color ?? '#38bdf8'}12`,
                        border: `1px solid ${cityData.risk_score?.color ?? '#38bdf8'}30`,
                        borderRadius: '16px', padding: '1rem 1.25rem',
                        textAlign: 'center', minWidth: '90px',
                        boxShadow: `0 0 20px ${cityData.risk_score?.color ?? '#38bdf8'}15`,
                      }}>
                        <div style={{
                          fontSize: '2.25rem', fontWeight: 800,
                          color: cityData.risk_score?.color ?? '#38bdf8',
                          lineHeight: 1,
                        }}>
                          {cityData.aqi?.value ?? '—'}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          color: cityData.risk_score?.color ?? '#38bdf8',
                          letterSpacing: '2px', marginTop: '4px', fontWeight: 600,
                        }}>
                          AQI
                        </div>
                      </div>
                    </div>

                    {/* Inner tabs */}
                    <div style={{
                      display: 'flex', gap: '0',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {CITY_TABS.map(tab => (
                        <button key={tab} onClick={() => setCityTab(tab)} style={{
                          padding: '0.625rem 1.1rem',
                          fontSize: '0.82rem', fontWeight: cityTab === tab ? 600 : 400,
                          color: cityTab === tab ? '#38bdf8' : '#475569',
                          background: 'transparent', border: 'none',
                          borderBottom: cityTab === tab ? '2px solid #38bdf8' : '2px solid transparent',
                          marginBottom: '-1px', cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          transition: 'color 0.15s',
                        }}>
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab content */}
                  <div style={{ padding: '1.5rem' }}>
                    {cityTab === 'Overview' && <CityCard data={cityData} embedded />}
                    {cityTab === 'AI Insight' && <InsightCard city={cityData.city} />}
                    {cityTab === 'Risk Score' && <RiskScore data={cityData} embedded />}
                    {cityTab === 'Forecast' && <ForecastChart city={cityData.city} embedded />}
                  </div>
                </div>
              </>
            )}

            {/* Empty state */}
            {!cityData && !loading && !error && (
              <div style={{
                textAlign: 'center', padding: '5rem 2rem',
                border: '1px dashed rgba(255,255,255,0.05)',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.01)',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'rgba(56,189,248,0.08)',
                  border: '1px solid rgba(56,189,248,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem', color: '#334155',
                }}>
                  <IconSearch />
                </div>
                <p style={{ color: '#334155', fontSize: '0.875rem' }}>
                  Search any city to view live environmental data
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function ComparePlaceholder() {
  return (
    <div style={{
      textAlign: 'center', padding: '5rem 2rem',
      border: '1px dashed rgba(255,255,255,0.05)',
      borderRadius: '20px',
    }}>
      <div style={{
        fontSize: '1.5rem', fontWeight: 700,
        background: 'linear-gradient(90deg, #38bdf8, #34d399)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
      }}>
        City Comparison
      </div>
      <p style={{ color: '#334155', fontSize: '0.875rem' }}>Coming soon — compare AQI, weather & risk across multiple cities</p>
    </div>
  )
}

function ForecastPlaceholder() {
  return (
    <div style={{
      textAlign: 'center', padding: '5rem 2rem',
      border: '1px dashed rgba(255,255,255,0.05)',
      borderRadius: '20px',
    }}>
      <div style={{
        fontSize: '1.5rem', fontWeight: 700,
        background: 'linear-gradient(90deg, #38bdf8, #34d399)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '0.5rem',
      }}>
        72h Forecast
      </div>
      <p style={{ color: '#334155', fontSize: '0.875rem' }}>Coming soon — dedicated AQI forecast page for any city</p>
    </div>
  )
}