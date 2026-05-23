import { useState } from 'react'
import { IconSearch, IconLoader } from './icons'

export default function SearchBar({ onSearch, loading }) {
  const [city, setCity] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (city.trim()) onSearch(city.trim())
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.25rem' }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: '0.625rem',
        background: '#1e293b', border: '1px solid #334155',
        borderRadius: '12px', padding: '0 1rem',
      }}>
        <span style={{ color: '#475569', display: 'flex' }}><IconSearch /></span>
        <input
          type="text" value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Search any city — Delhi, London, Tokyo..."
          style={{
            flex: 1, padding: '0.8rem 0', background: 'transparent',
            border: 'none', color: '#e2e8f0', fontSize: '0.95rem', outline: 'none',
          }}
        />
      </div>
      <button type="submit" disabled={loading} style={{
        padding: '0.8rem 1.5rem', borderRadius: '12px', border: 'none',
        background: loading ? '#1e293b' : 'linear-gradient(90deg, #38bdf8, #34d399)',
        color: loading ? '#475569' : '#0b1120',
        fontWeight: 600, fontSize: '0.9rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap',
      }}>
        <span style={{ display: 'flex' }}>{loading ? <IconLoader /> : <IconSearch />}</span>
        {loading ? 'Searching' : 'Search'}
      </button>
    </form>
  )
}