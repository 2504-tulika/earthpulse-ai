import { useEffect, useState } from 'react'

const LIVE_CITIES = [
  { city: 'Delhi', country: 'IN', aqi: null, level: null, color: '#f97316' },
  { city: 'New York', country: 'US', aqi: null, level: null, color: '#34d399' },
  { city: 'Beijing', country: 'CN', aqi: null, level: null, color: '#f97316' },
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

function getAQILevel(aqi) {
  if (!aqi)       return '—'
  if (aqi <= 50)  return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}

function FloatingCard({ city, country, aqi, delay }) {
  const color = getAQIColor(aqi)
  const level = getAQILevel(aqi)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px', padding: '1rem 1.125rem',
      minWidth: '130px',
      animation: `floatCard 4s ease-in-out ${delay}s infinite`,
    }}>
      <style>{`
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
        {city}, {country}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color, lineHeight: 1 }}>
        {aqi ?? '—'}
      </div>
      <div style={{ fontSize: '0.65rem', color: '#475569', marginBottom: '6px' }}>AQI</div>
      <div style={{
        display: 'inline-block', fontSize: '0.65rem',
        padding: '2px 8px', borderRadius: '6px',
        background: `${color}15`, color,
      }}>
        {level}
      </div>
    </div>
  )
}

export default function Hero({ onExplore, onMap }) {
  const [cities, setCities] = useState(LIVE_CITIES)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)

    // Fetch live AQI for hero cards
    const fetchHeroCities = async () => {
      const updated = await Promise.all(
        LIVE_CITIES.map(async (c) => {
          try {
            const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
            const res = await fetch(`${BASE}/api/v1/city/${c.city}`)
            const data = await res.json()
            return { ...c, aqi: data.aqi?.value }
          } catch {
            return c
          }
        })
      )
      setCities(updated)
    }
    fetchHeroCities()
  }, [])

  const fadeUp = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
    transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
  })

  return (
    <div style={{
      minHeight: '90vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '4rem 1.5rem 3rem',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background orbs */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        borderRadius: '50%', top: '-150px', left: '-150px',
        background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%', bottom: '-100px', right: '-100px',
        background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Live badge */}
      <div style={{ ...fadeUp(0), marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(56,189,248,0.08)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '20px', padding: '6px 16px',
          fontSize: '0.78rem', color: '#38bdf8',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#38bdf8',
            animation: 'pulse 1.5s infinite',
          }} />
          <style>{`
            @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
          `}</style>
          Live data from 10,000+ monitoring stations worldwide
        </div>
      </div>

      {/* Headline */}
      <div style={{ ...fadeUp(0.1), marginBottom: '1.25rem' }}>
        <h1 style={{
          fontSize: 'clamp(2.25rem, 6vw, 4rem)',
          fontWeight: 800, letterSpacing: '-2px',
          lineHeight: 1.05, margin: 0,
          fontFamily: 'Inter, sans-serif',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            The planet's air quality,
          </span>
          <br />
          <span style={{
            background: 'linear-gradient(90deg, #38bdf8, #34d399)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            intelligently monitored.
          </span>
        </h1>
      </div>

      {/* Subtitle */}
      <div style={{ ...fadeUp(0.2), marginBottom: '2rem' }}>
        <p style={{
          color: '#475569', fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
          lineHeight: 1.7, maxWidth: '520px', margin: '0 auto',
          fontFamily: 'Inter, sans-serif',
        }}>
          Real-time AQI, weather forecasts, AI insights and environmental
          risk scores for any city — powered by XGBoost ML.
        </p>
      </div>

      {/* CTA buttons */}
      <div style={{
        ...fadeUp(0.3),
        display: 'flex', gap: '0.75rem',
        justifyContent: 'center', flexWrap: 'wrap',
        marginBottom: '3rem',
      }}>
        <button onClick={onExplore} style={{
          padding: '14px 32px', borderRadius: '12px', border: 'none',
          background: 'linear-gradient(90deg, #38bdf8, #34d399)',
          color: '#060d1f', fontWeight: 700, fontSize: '0.95rem',
          cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          transition: 'transform 0.15s, opacity 0.15s',
        }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.03)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          Explore Dashboard
        </button>
        <button onClick={onMap} style={{
            padding: '14px 32px', borderRadius: '12px',
            border: '1px solid rgba(56,189,248,0.4)',
            background: 'rgba(56,189,248,0.08)',
            color: '#38bdf8', fontWeight: 600, fontSize: '0.95rem',
            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.6)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)' }}
    >
        View Global Map
    </button>
      </div>

      {/* Stats row */}
      <div style={{
        ...fadeUp(0.4),
        display: 'flex', gap: '2rem', justifyContent: 'center',
        flexWrap: 'wrap', marginBottom: '3rem',
      }}>
        {[
          { val: '10K+', label: 'Monitoring Stations' },
          { val: '72h', label: 'ML Forecast' },
          { val: 'Live', label: 'Real-Time Data' },
          { val: 'AI', label: 'Powered Insights' },
        ].map(({ val, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.75rem', fontWeight: 800,
              background: 'linear-gradient(90deg, #38bdf8, #34d399)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: 'Inter, sans-serif',
            }}>
              {val}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px' }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Floating city cards */}
      <div style={{
        ...fadeUp(0.5),
        display: 'flex', gap: '0.875rem',
        justifyContent: 'center', flexWrap: 'wrap',
      }}>
        {cities.map((c, i) => (
          <FloatingCard key={c.city} {...c} delay={i * 0.5} />
        ))}
      </div>
        </div>
  )
}