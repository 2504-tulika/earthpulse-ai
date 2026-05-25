import { useEffect, useState } from 'react'

export default function InsightCard({ city }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
  if (!city) return
  const fetchInsight = () => {
    setLoading(true)
    setError(null)
    setInsight(null)
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/insight/${city}`)
      .then(r => r.json())
      .then(data => { setInsight(data); setLoading(false) })
      .catch(() => { setError('Insight unavailable'); setLoading(false) })
  }
  fetchInsight()
}, [city])

  if (!city) return null

  return (
    <div>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '0.5rem', marginBottom: '0.875rem',
      }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: '#38bdf8',
          animation: loading ? 'blink 1s infinite' : 'none',
          boxShadow: '0 0 6px #38bdf8',
        }} />
        <span style={{
          fontSize: '0.78rem', fontWeight: 600,
          color: '#38bdf8', letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          AI Environmental Insight
        </span>
        <span style={{
          fontSize: '0.68rem', color: '#334155',
          marginLeft: 'auto',
        }}>
          Powered by Llama 3
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '16px', height: '16px', flexShrink: 0,
            border: '2px solid rgba(56,189,248,0.1)',
            borderTop: '2px solid #38bdf8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: '#334155', fontSize: '0.85rem' }}>
            Analyzing environmental conditions...
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: '#475569', fontSize: '0.85rem' }}>{error}</p>
      )}

      {/* Insight */}
      {insight && !loading && (
        <>
          <p style={{
            color: '#94a3b8', fontSize: '0.925rem',
            lineHeight: 1.75, margin: 0,
          }}>
            {insight.insight}
          </p>
          <div style={{
            display: 'flex', gap: '0.625rem',
            marginTop: '0.875rem', flexWrap: 'wrap',
          }}>
            {[
              `AQI ${insight.aqi}`,
              `Risk ${insight.risk_score}/100`,
              `${insight.risk_level} Risk`,
            ].map(tag => (
              <span key={tag} style={{
                fontSize: '0.72rem', color: '#475569',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px', padding: '3px 10px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}