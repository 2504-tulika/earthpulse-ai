function RiskRing({ score, color }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const filled = (score / 100) * circumference
  const gap = circumference - filled

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Background ring */}
      <circle
        cx="70" cy="70" r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="10"
      />
      {/* Score ring */}
      <circle
        cx="70" cy="70" r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${gap}`}
        strokeDashoffset={circumference * 0.25}
        style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${color})` }}
      />
      {/* Score text */}
      <text x="70" y="65" textAnchor="middle"
        fill={color} fontSize="26" fontWeight="800"
        fontFamily="Inter, sans-serif">
        {score}
      </text>
      <text x="70" y="82" textAnchor="middle"
        fill="#475569" fontSize="10"
        fontFamily="Inter, sans-serif" letterSpacing="1">
        / 100
      </text>
    </svg>
  )
}

function BreakdownBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: '0.625rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{label}</span>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{value}/100</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${value}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 1s ease',
          boxShadow: `0 0 6px ${color}60`,
        }} />
      </div>
    </div>
  )
}

export default function RiskScore({ data }) {
  if (!data?.risk_score) return null

  const { score, level, color, breakdown } = data.risk_score

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      backdropFilter: 'blur(10px)',
      animation: 'fadeSlideIn 0.4s ease',
    }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '2px' }}>
          EarthPulse Risk Score
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#475569' }}>
          Composite environmental risk — AQI · Heat · Humidity · Pollution
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* Ring */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <RiskRing score={score} color={color} />
          <div style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: color,
          }}>
            {level} Risk
          </div>
        </div>

        {/* Breakdown bars */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <BreakdownBar
            label="AQI Impact (40%)"
            value={breakdown.aqi_score}
            color="#38bdf8"
          />
          <BreakdownBar
            label="Heat Stress (25%)"
            value={breakdown.heat_score}
            color="#f97316"
          />
          <BreakdownBar
            label="Humidity Stress (15%)"
            value={breakdown.humidity_score}
            color="#a78bfa"
          />
          <BreakdownBar
            label="Pollutant Danger (20%)"
            value={breakdown.pollutant_score}
            color="#ef4444"
          />
        </div>
      </div>
    </div>
  )
}