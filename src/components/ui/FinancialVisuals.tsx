import type { CSSProperties } from 'react'
import type { Metrics } from '../../engine/types'

export function AnimatedMoney({ value, prefix = '₹' }: { value: number; prefix?: string }) {
  return <span className="number-pop" key={value}>{prefix}{Math.round(value).toLocaleString('en-IN')}</span>
}

export function RiskBadge({ metrics }: { metrics: Metrics }) {
  return <span className={`risk-badge risk-${metrics.riskLevel.toLowerCase()}`} data-testid="risk-level">
    <span className="status-dot" />{metrics.riskLevel} risk
  </span>
}

export function ScoreRing({ value, label, color = 'mint' }: { value: number; label?: string; color?: 'mint' | 'purple' | 'amber' }) {
  return <div className={`ring ring-${color}`} style={{ '--score': value } as CSSProperties} role="img" aria-label={`${value} ${label ?? 'out of 100'}`}>
    <div className="ring-inner" aria-hidden="true"><strong>{value}</strong><span>{label ?? '/100'}</span></div>
  </div>
}
