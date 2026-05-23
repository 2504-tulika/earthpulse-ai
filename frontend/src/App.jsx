import { useState } from 'react'
import { IconPin, IconSearch } from './components/icons'
import Navbar from './components/Navbar'
import SearchBar from './components/SearchBar'
import CityCard from './components/CityCard'
import { getCitySummary } from './services/api'

const QUICK_CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'London', 'Tokyo', 'New York']

export default function App() {
  const [cityData, setCityData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeCity, setActiveCity] = useState(null)

  const handleSearch = async (city) => {
    setLoading(true)
    setError(null)
    setCityData(null)
    setActiveCity(city)
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
    <div style={{ minHeight: '100vh', background: '#0b1120' }}>
      <Navbar />
      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '2rem 1rem' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 700,
            letterSpacing: '-0.5px', marginBottom: '0.4rem',
            background: 'linear-gradient(90deg, #38bdf8, #34d399)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Environmental Intelligence
          </h1>
          <p style={{ color: '#475569', fontSize: '0.9rem' }}>
            Live air quality, weather & risk data for any city worldwide
          </p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {/* Quick chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {QUICK_CITIES.map(city => (
            <button key={city} onClick={() => handleSearch(city)} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '5px 14px', borderRadius: '20px', border: '1px solid',
              borderColor: activeCity === city ? '#38bdf8' : '#1e293b',
              background: activeCity === city ? '#38bdf810' : 'transparent',
              color: activeCity === city ? '#38bdf8' : '#475569',
              fontSize: '0.8rem', cursor: 'pointer',
            }}>
              <span style={{ color: 'inherit', display: 'flex' }}><IconPin /></span>
              {city}
            </button>
          ))}
        </div>

        {/* Loading spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{
              width: '32px', height: '32px',
              border: '2px solid #1e293b', borderTop: '2px solid #38bdf8',
              borderRadius: '50%', margin: '0 auto 1rem',
              animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#475569', fontSize: '0.875rem' }}>Fetching live data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#ef444410', border: '1px solid #ef444430',
            borderRadius: '12px', padding: '0.875rem 1rem',
            color: '#ef4444', fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        {cityData && <CityCard data={cityData} />}

        {/* Empty state */}
        {!cityData && !loading && !error && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            border: '1px dashed #1e293b', borderRadius: '16px',
          }}>
            <span style={{ color: '#1e293b', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <IconSearch />
            </span>
            <p style={{ color: '#334155', fontSize: '0.875rem' }}>
              Search a city or select one above
            </p>
          </div>
        )}

      </main>
    </div>
  )
}