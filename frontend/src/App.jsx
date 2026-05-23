import { useState } from 'react'
import { IconPin, IconSearch } from './components/icons'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import CityCard from './components/CityCard'
import MapView from './components/Map'
import { getCitySummary } from './services/api'

const QUICK_CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'London', 'Tokyo', 'New York']

export default function App() {
  const [cityData, setCityData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeCity, setActiveCity] = useState(null)
  const [view, setView] = useState('dashboard')

  const handleSearch = async (city) => {
    setLoading(true)
    setError(null)
    setCityData(null)
    setActiveCity(city)
    setView('dashboard')
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

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>

        {view === 'map' ? <MapView /> : (
          <>
            {/* Hero */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-block',
                background: 'rgba(56,189,248,0.08)',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.75rem',
                color: '#38bdf8',
                fontWeight: 500,
                marginBottom: '1rem',
                letterSpacing: '0.3px',
              }}>
                Live Environmental Intelligence
              </div>
              <h1 style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
                fontWeight: 800,
                letterSpacing: '-1px',
                lineHeight: 1.1,
                marginBottom: '0.75rem',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Environmental<br />
                <span style={{
                  background: 'linear-gradient(90deg, #38bdf8, #34d399)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Intelligence
                </span>
              </h1>
              <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '480px', lineHeight: 1.6 }}>
                Real-time air quality, weather conditions & environmental risk data for cities worldwide.
              </p>
            </div>

            <SearchBar onSearch={handleSearch} loading={loading} />

            {/* Quick chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              {QUICK_CITIES.map(city => (
                <button key={city} onClick={() => handleSearch(city)} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 14px', borderRadius: '20px',
                  border: '1px solid',
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
                <p style={{ color: '#334155', fontSize: '0.875rem' }}>Fetching live environmental data...</p>
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

            {cityData && <CityCard data={cityData} />}

            {/* Empty state */}
            {!cityData && !loading && !error && (
              <div style={{
                textAlign: 'center', padding: '5rem 2rem',
                border: '1px dashed rgba(255,255,255,0.05)',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.01)',
              }}>
                <div style={{
                  width: '48px', height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(56,189,248,0.08)',
                  border: '1px solid rgba(56,189,248,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#334155',
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