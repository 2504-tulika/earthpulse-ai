import { IconGlobe } from './icons'

export default function Navbar() {
  return (
    <nav style={{
      background: '#0b1120',
      borderBottom: '1px solid #1e293b',
      padding: '0.875rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
        <IconGlobe />
        <span style={{
          fontSize: '1.1rem', fontWeight: 700,
          background: 'linear-gradient(90deg, #38bdf8, #34d399)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.3px',
        }}>
          EarthPulse AI
        </span>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {['Dashboard', 'Map', 'Compare', 'Forecast'].map((item, i) => (
          <span key={item} style={{
            fontSize: '0.85rem', cursor: 'pointer',
            color: i === 0 ? '#38bdf8' : '#475569',
            borderBottom: i === 0 ? '1px solid #38bdf8' : 'none',
            paddingBottom: '2px',
          }}>{item}</span>
        ))}
      </div>
    </nav>
  )
}