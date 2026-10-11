import { useId, useMemo, useState } from 'react'
import type { ForecastPoint } from '../engine/types'
import { inr } from '../lib/format'

interface Props { data: ForecastPoint[]; full?: boolean }
type Series = 'expected' | 'best' | 'worst'

const WIDTH = 720
const HEIGHT = 280
const PAD = { top: 18, right: 18, bottom: 30, left: 52 }

function linePath(data: ForecastPoint[], key: Series, min: number, max: number) {
  const xSpan = WIDTH - PAD.left - PAD.right
  const ySpan = HEIGHT - PAD.top - PAD.bottom
  return data.map((point, index) => {
    const x = PAD.left + (index / Math.max(1, data.length - 1)) * xSpan
    const y = PAD.top + (1 - (point[key] - min) / Math.max(1, max - min)) * ySpan
    return `${index ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

export default function ForecastChart({ data, full = false }: Props) {
  const gradientId = useId().replace(/:/g, '')
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const bounds = useMemo(() => {
    const keys: Series[] = full ? ['expected', 'best', 'worst'] : ['expected']
    const values = data.flatMap(point => keys.map(key => point[key]))
    const min = Math.min(0, ...values)
    const max = Math.max(1, ...values)
    const padding = Math.max(300, (max - min) * .08)
    return { min: min - padding, max: max + padding }
  }, [data, full])
  const paths = useMemo(() => ({
    expected: linePath(data, 'expected', bounds.min, bounds.max),
    best: linePath(data, 'best', bounds.min, bounds.max),
    worst: linePath(data, 'worst', bounds.min, bounds.max),
  }), [data, bounds])
  const expectedArea = `${paths.expected} L${WIDTH - PAD.right},${HEIGHT - PAD.bottom} L${PAD.left},${HEIGHT - PAD.bottom} Z`
  const active = activeIndex === null ? null : data[activeIndex]
  const ticks = [0, .25, .5, .75, 1]

  return <div className="native-chart">
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby={`${gradientId}-title ${gradientId}-desc`} onPointerMove={event => { const box = event.currentTarget.getBoundingClientRect(); const ratio = Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)); setActiveIndex(Math.round(ratio * Math.max(0, data.length - 1))) }} onPointerLeave={() => setActiveIndex(null)}>
      <title id={`${gradientId}-title`}>Thirty-day balance forecast</title>
      <desc id={`${gradientId}-desc`}>Expected balance ends at {inr(data.at(-1)?.expected ?? 0)}. {full ? `Best case ${inr(data.at(-1)?.best ?? 0)} and worst case ${inr(data.at(-1)?.worst ?? 0)}.` : ''}</desc>
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00e6a4" stopOpacity=".28" /><stop offset="100%" stopColor="#00e6a4" stopOpacity="0" /></linearGradient></defs>
      {ticks.map(tick => { const y = PAD.top + tick * (HEIGHT - PAD.top - PAD.bottom); const value = bounds.max - tick * (bounds.max - bounds.min); return <g key={tick}><line x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} className="chart-grid" /><text x={PAD.left - 9} y={y + 4} textAnchor="end" className="chart-label">₹{Math.round(value / 1000)}k</text></g> })}
      <path d={expectedArea} fill={`url(#${gradientId})`} /><path d={paths.expected} className="chart-line expected" />
      {full && <><path d={paths.best} className="chart-line best" /><path d={paths.worst} className="chart-line worst" /></>}
      {data.filter((_, index) => index === 0 || index === data.length - 1 || (full && index % 6 === 0)).map(point => { const index = data.indexOf(point); const x = PAD.left + (index / Math.max(1, data.length - 1)) * (WIDTH - PAD.left - PAD.right); return <text key={point.day} x={x} y={HEIGHT - 8} textAnchor={index === 0 ? 'start' : index === data.length - 1 ? 'end' : 'middle'} className="chart-label">D{point.day}</text> })}
      {active && (() => { const x = PAD.left + ((activeIndex ?? 0) / Math.max(1, data.length - 1)) * (WIDTH - PAD.left - PAD.right); return <line x1={x} x2={x} y1={PAD.top} y2={HEIGHT - PAD.bottom} className="chart-cursor" /> })()}
    </svg>
    {active && <div className="chart-tooltip"><b>Day {active.day}</b><span>Expected {inr(active.expected)}</span>{full && <><span>Best {inr(active.best)}</span><span>Worst {inr(active.worst)}</span></>}</div>}
    <details className="chart-summary"><summary>Accessible forecast summary</summary><p>Day {data.at(0)?.day}: {inr(data.at(0)?.expected ?? 0)}. Day {data.at(-1)?.day}: expected {inr(data.at(-1)?.expected ?? 0)}{full ? `, best ${inr(data.at(-1)?.best ?? 0)}, worst ${inr(data.at(-1)?.worst ?? 0)}` : ''}.</p></details>
  </div>
}
