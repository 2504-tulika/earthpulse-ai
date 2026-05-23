import { IconGlobe } from './icons'

export default function Navbar({ view, setView }) {
  const links = [
    { label: 'Dashboard', key: 'dashboard' },
    { label: 'Map',       key: 'map' },
  ]

  return (
    <nav style={{
      background: 'rgba(6, 13, 31, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '60px',
    }}>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(135deg, #0ea5e9, #10b981)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <IconGlobe />
        </div>
        <span style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          letterSpacing: '-0.3px',
          background: 'linear-gradient(90deg, #38bdf8, #34d399)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          EarthPulse AI
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {links.map(({ label, key }) => (
          <button key={key} onClick={() => setView(key)} style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: 'none',
            background: view === key ? 'rgba(56,189,248,0.1)' : 'transparent',
            color: view === key ? '#38bdf8' : '#64748b',
            fontSize: '0.85rem',
            fontWeight: view === key ? 600 : 400,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}>
            {label}
          </button>
        ))}
        {['Compare', 'Forecast'].map(item => (
          <button key={item} style={{
            padding: '6px 14px', borderRadius: '8px',
            border: 'none', background: 'transparent',
            color: '#2d3f55', fontSize: '0.85rem',
            cursor: 'not-allowed', fontFamily: 'Inter, sans-serif',
          }}>
            {item}
          </button>
        ))}
      </div>
    </nav>
  )
}