import { useState, useEffect } from 'react'
import {
  IconThermometer, IconDroplets, IconWind,
  IconGauge, IconCloud, IconAlert, IconCheck, IconPin
} from './icons'

const AQI_CONFIG = {
  'Good':                           { color: '#34d399', bg: 'rgba(52,211,153,0.08)', Icon: IconCheck,  gradient: '#34d39940' },
  'Moderate':                       { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', Icon: IconAlert,  gradient: '#fbbf2440' },
  'Unhealthy for Sensitive Groups': { color: '#f97316', bg: 'rgba(249,115,22,0.08)', Icon: IconAlert,  gradient: '#f9731640' },
  'Unhealthy':                      { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  Icon: IconAlert,  gradient: '#ef444440' },
  'Very Unhealthy':                 { color: '#a855f7', bg: 'rgba(168,85,247,0.08)', Icon: IconAlert,  gradient: '#a855f740' },
  'Hazardous':                      { color: '#dc2626', bg: 'rgba(220,38,38,0.08)',  Icon: IconAlert,  gradient: '#dc262640' },
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!value) return
    let start = 0
    const end = parseInt(value)
    const duration = 1000
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return <span>{display}</span>
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
      padding: '1rem 0.75rem',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '6px', textAlign: 'center',
      transition: 'background 0.2s, border-color 0.2s',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(56,189,248,0.05)'
      e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
    }}
    >
      <span style={{ color: '#38bdf8', display: 'flex', opacity: 0.8 }}><Icon /></span>
      <span style={{ fontSize: '0.67rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'capitalize' }}>
        {value}
      </span>
    </div>
  )
}

export default function CityCard({ data }) {
  const { city, country, weather, aqi } = data
  const cfg = AQI_CONFIG[aqi?.level] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', Icon: IconAlert, gradient: '#94a3b840' }
  const { Icon: AqiIcon } = cfg

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      marginBottom: '1.5rem',
      boxShadow: `0 0 40px ${cfg.gradient}`,
      animation: 'fadeSlideIn 0.4s ease',
    }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top accent bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${cfg.color}, #38bdf8, #10b981)` }} />

      <div style={{ padding: '1.5rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '1.5rem',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', color: '#475569' }}>
              <IconPin />
              <span style={{ fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.3px' }}>{country}</span>
            </div>
            <h2 style={{
              fontSize: '2rem', fontWeight: 800,
              color: '#f1f5f9', letterSpacing: '-0.8px',
              lineHeight: 1,
            }}>
              {city}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', textTransform: 'capitalize' }}>
              {weather?.description}
            </p>
          </div>

          {/* AQI Badge */}
          <div style={{
            background: cfg.bg,
            border: `1px solid ${cfg.color}30`,
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            textAlign: 'center',
            minWidth: '90px',
            boxShadow: `0 0 20px ${cfg.color}20`,
          }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: cfg.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              <AnimatedNumber value={aqi?.value} />
            </div>
            <div style={{ fontSize: '0.6rem', color: cfg.color, letterSpacing: '2px', marginTop: '4px', fontWeight: 600 }}>
              AQI
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.625rem',
          marginBottom: '1rem',
        }}>
          <StatTile icon={IconThermometer} label="Temperature" value={`${weather?.temperature}°C`} />
          <StatTile icon={IconThermometer} label="Feels Like"  value={`${weather?.feels_like}°C`} />
          <StatTile icon={IconDroplets}   label="Humidity"     value={`${weather?.humidity}%`} />
          <StatTile icon={IconWind}       label="Wind"         value={`${weather?.wind_speed} m/s`} />
          <StatTile icon={IconGauge}      label="Pressure"     value={`${weather?.pressure} hPa`} />
          <StatTile icon={IconCloud}      label="Condition"    value={weather?.description} />
        </div>

        {/* AQI status strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.875rem 1rem',
          background: cfg.bg,
          borderRadius: '12px',
          border: `1px solid ${cfg.color}20`,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: cfg.color, display: 'flex' }}><AqiIcon /></span>
          <span style={{ color: cfg.color, fontSize: '0.875rem', fontWeight: 600 }}>
            {aqi?.level}
          </span>
          <span style={{ color: '#334155', fontSize: '0.8rem', marginLeft: 'auto' }}>
            Dominant pollutant:{' '}
            <span style={{ color: '#64748b', fontWeight: 600 }}>
              {aqi?.dominant_pollutant?.toUpperCase() ?? '—'}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}