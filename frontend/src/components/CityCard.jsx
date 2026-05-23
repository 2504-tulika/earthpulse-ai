import {
  IconThermometer, IconDroplets, IconWind,
  IconGauge, IconCloud, IconAlert, IconCheck, IconPin
} from './icons'

const AQI_CONFIG = {
  'Good':                           { color: '#34d399', bg: '#34d39912', Icon: IconCheck },
  'Moderate':                       { color: '#fbbf24', bg: '#fbbf2412', Icon: IconAlert },
  'Unhealthy for Sensitive Groups': { color: '#f97316', bg: '#f9731612', Icon: IconAlert },
  'Unhealthy':                      { color: '#ef4444', bg: '#ef444412', Icon: IconAlert },
  'Very Unhealthy':                 { color: '#a855f7', bg: '#a855f712', Icon: IconAlert },
  'Hazardous':                      { color: '#dc2626', bg: '#dc262612', Icon: IconAlert },
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <div style={{
      background: '#0b1120', borderRadius: '10px',
      padding: '0.875rem 0.75rem',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '5px', textAlign: 'center',
    }}>
      <span style={{ color: '#38bdf8', display: 'flex' }}><Icon /></span>
      <span style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#e2e8f0', textTransform: 'capitalize' }}>
        {value}
      </span>
    </div>
  )
}

export default function CityCard({ data }) {
  const { city, country, weather, aqi } = data
  const cfg = AQI_CONFIG[aqi?.level] || { color: '#94a3b8', bg: '#94a3b812', Icon: IconAlert }
  const { Icon: AqiIcon } = cfg

  return (
    <div style={{
      background: '#1e293b', borderRadius: '16px',
      border: '1px solid #334155', overflow: 'hidden',
      marginBottom: '1.5rem',
    }}>
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${cfg.color}, #38bdf8)` }} />

      <div style={{ padding: '1.25rem' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '1.25rem',
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', color: '#475569' }}>
              <IconPin />
              <span style={{ fontSize: '0.8rem' }}>{country}</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.5px' }}>
              {city}
            </h2>
          </div>

          <div style={{
            background: cfg.bg, border: `1px solid ${cfg.color}40`,
            borderRadius: '12px', padding: '0.75rem 1.1rem',
            textAlign: 'center', minWidth: '80px',
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: cfg.color, lineHeight: 1 }}>
              {aqi?.value ?? '—'}
            </div>
            <div style={{ fontSize: '0.65rem', color: cfg.color, letterSpacing: '1.5px', marginTop: '3px' }}>
              AQI
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '0.625rem', marginBottom: '1rem',
        }}>
          <StatTile icon={IconThermometer} label="Temperature" value={`${weather?.temperature}°C`} />
          <StatTile icon={IconThermometer} label="Feels Like"  value={`${weather?.feels_like}°C`} />
          <StatTile icon={IconDroplets}   label="Humidity"     value={`${weather?.humidity}%`} />
          <StatTile icon={IconWind}       label="Wind"         value={`${weather?.wind_speed} m/s`} />
          <StatTile icon={IconGauge}      label="Pressure"     value={`${weather?.pressure} hPa`} />
          <StatTile icon={IconCloud}      label="Condition"    value={weather?.description} />
        </div>

        {/* AQI strip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          padding: '0.75rem 1rem', background: cfg.bg,
          borderRadius: '10px', border: `1px solid ${cfg.color}20`,
          flexWrap: 'wrap',
        }}>
          <span style={{ color: cfg.color, display: 'flex' }}><AqiIcon /></span>
          <span style={{ color: cfg.color, fontSize: '0.85rem', fontWeight: 600 }}>
            {aqi?.level}
          </span>
          <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: 'auto' }}>
            Pollutant: <strong style={{ color: '#94a3b8' }}>{aqi?.dominant_pollutant?.toUpperCase() ?? '—'}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}