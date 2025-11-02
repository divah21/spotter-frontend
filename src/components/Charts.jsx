import React from 'react'

function getExtents(data) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  // pad
  const pad = (max - min) * 0.1 || 1
  return { min: min - pad, max: max + pad }
}

export function LineChart({ data = [], labels = [], color = '#0ea5e9', strokeWidth = 2, height = 220 }) {
  const width = 600
  const { min, max } = getExtents(data)
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (width - 40) + 20
    const y = height - 30 - ((d - min) / (max - min || 1)) * (height - 60)
    return [x, y]
  })
  const path = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
      {/* axes */}
      <line x1="20" y1={height - 30} x2={width - 20} y2={height - 30} stroke="#e5e7eb" />
      <line x1="20" y1="20" x2="20" y2={height - 30} stroke="#e5e7eb" />

      {/* labels */}
      {labels.map((l, i) => (
        <text key={i} x={(i / (labels.length - 1 || 1)) * (width - 40) + 20} y={height - 10} fontSize="10" textAnchor="middle" fill="#64748b">
          {l}
        </text>
      ))}

      {/* path */}
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />
      ))}
    </svg>
  )
}

export function BarChart({ data = [], labels = [], color = '#10b981', height = 220 }) {
  const width = 600
  const { min, max } = getExtents(data)
  const band = (width - 40) / (data.length || 1)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
      <line x1="20" y1={height - 30} x2={width - 20} y2={height - 30} stroke="#e5e7eb" />
      <line x1="20" y1="20" x2="20" y2={height - 30} stroke="#e5e7eb" />

      {data.map((d, i) => {
        const h = ((d - min) / (max - min || 1)) * (height - 60)
        const x = 20 + i * band + 8
        const y = height - 30 - h
        const w = band - 16
        return <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill={color} />
      })}

      {labels.map((l, i) => (
        <text key={i} x={20 + i * band + band / 2} y={height - 10} fontSize="10" textAnchor="middle" fill="#64748b">
          {l}
        </text>
      ))}
    </svg>
  )
}

export default { LineChart, BarChart }
