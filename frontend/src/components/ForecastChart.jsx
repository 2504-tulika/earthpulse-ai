import { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const AQI_ZONES = [
  { value: 50,  color: '#34d399', label: 'Good' },
  { value: 100, color: '#fbbf24', label: 'Moderate' },
  { value: 150, color: '#f97316', label: 'Sensitive' },
  { value: 200, color: '#ef4444', label: 'Unhealthy' },
  { value: 300, color: '#a855f7', label: 'Very Unhealthy' },
]

function getAQIColor(aqi) {
  if (aqi <= 50)  return '#34d399'
  if (aqi <= 100) return '#fbbf24'
  if (aqi <= 150) return '#f97316'
  if (aqi <= 200) return '#ef4444'
  if (aqi <= 300) return '#a855f7'
  return '#dc2626'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const aqi = payload[0]?.value
  const color = getAQIColor(aqi)
  return (
    <div>
      <p style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '4px' }}>{label}</p>
      <p style={{ color, fontWeight: 700, fontSize: '1.1rem' }}>AQI {Math.round(aqi)}</p>
      <p style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>
        {payload[0]?.payload?.level}
      </p>
    </div>
  )
}

export default function ForecastChart({ city }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [range, setRange] = useState(24)

 useEffect(() => {
  if (!city) return
  const fetchForecast = () => {
    setLoading(true)
    setError(null)
    setData(null)
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/predict/${city}?hours=72`)
      .then(r => r.json())
      .then(json => { setData(json); setLoading(false) })
      .catch(() => { setError('Prediction unavailable'); setLoading(false) })
  }
  fetchForecast()
}, [city])

  if (!city) return null

  const chartData = data?.predictions
    ?.slice(0, range)
    ?.map(p => ({
      time: p.datetime.split(' ')[1].slice(0, 5),
      date: p.datetime.split(' ')[0],
      aqi: p.predicted_aqi,
      level: p.level,
      color: p.color,
    }))

  const avgAqi = chartData
    ? Math.round(chartData.reduce((s, d) => s + d.aqi, 0) / chartData.length)
    : null

  const dominantColor = avgAqi ? getAQIColor(avgAqi) : '#38bdf8'

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '16px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      backdropFilter: 'blur(10px)',
    }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1.25rem',
        flexWrap: 'wrap', gap: '0.75rem',
      }}>
        <div>
          <h3 style={{
            fontSize: '1rem', fontWeight: 700, color: '#f1f5f9',
            marginBottom: '2px',
          }}>
            AQI Forecast — {data?.city ?? city}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#475569' }}>
            XGBoost ML prediction · Updated live
          </p>
        </div>

        {/* Range selector */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {[24, 48, 72].map(h => (
            <button key={h} onClick={() => setRange(h)} style={{
              padding: '4px 12px', borderRadius: '8px', border: '1px solid',
              borderColor: range === h ? dominantColor : 'rgba(255,255,255,0.08)',
              background: range === h ? `${dominantColor}15` : 'transparent',
              color: range === h ? dominantColor : '#475569',
              fontSize: '0.75rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Current + avg stats */}
      {data && (
        <div style={{
          display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap',
        }}>
          <div style={{
            background: `${getAQIColor(data.current_aqi)}12`,
            border: `1px solid ${getAQIColor(data.current_aqi)}30`,
            borderRadius: '10px', padding: '0.625rem 1rem',
          }}>
            <div style={{ fontSize: '0.68rem', color: '#475569', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current AQI</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: getAQIColor(data.current_aqi) }}>
              {data.current_aqi}
            </div>
          </div>
          <div style={{
            background: `${dominantColor}12`,
            border: `1px solid ${dominantColor}30`,
            borderRadius: '10px', padding: '0.625rem 1rem',
          }}>
            <div style={{ fontSize: '0.68rem', color: '#475569', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg next {range}h</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: dominantColor }}>
              {avgAqi}
            </div>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px', padding: '0.625rem 1rem',
          }}>
            <div style={{ fontSize: '0.68rem', color: '#475569', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>XGBoost</div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#475569', fontSize: '0.875rem' }}>
          <div style={{
            width: '24px', height: '24px',
            border: '2px solid rgba(255,255,255,0.05)',
            borderTop: `2px solid ${dominantColor}`,
            borderRadius: '50%', margin: '0 auto 0.75rem',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          Running ML prediction...
        </div>
      )}

      {error && (
        <div style={{ color: '#f87171', fontSize: '0.8rem', padding: '1rem' }}>{error}</div>
      )}

      {/* Chart */}
      {chartData && !loading && (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={dominantColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={dominantColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              interval={range === 24 ? 3 : range === 48 ? 7 : 11}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* AQI threshold lines */}
            <ReferenceLine y={50}  stroke="#34d399" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={100} stroke="#fbbf24" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" strokeOpacity={0.4} />
            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke={dominantColor}
              strokeWidth={2}
              fill="url(#aqiGradient)"
              dot={false}
              activeDot={{ r: 4, fill: dominantColor, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* AQI zone legend */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap',
        marginTop: '0.75rem', paddingTop: '0.75rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {AQI_ZONES.map(z => (
          <div key={z.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '20px', height: '2px', background: z.color, opacity: 0.6 }} />
            <span style={{ fontSize: '0.68rem', color: '#334155' }}>{z.label} ≤{z.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}