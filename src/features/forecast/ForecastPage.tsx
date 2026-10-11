import { useMemo } from 'react'
import { ArrowUpRight, CalendarDays, CreditCard, RefreshCcw } from 'lucide-react'
import ForecastChart from '../../components/ForecastChart'
import { RiskBadge, ScoreRing } from '../../components/ui/FinancialVisuals'
import { calculateMetrics } from '../../engine/engine'
import type { FinanceState, Metrics } from '../../engine/types'
import { inr } from '../../lib/format'
import { useFinanceStore } from '../../store/useFinanceStore'

function RiskCenter({ metrics }: { metrics: Metrics }) {
  return <article className="panel risk-center"><div className="section-title"><div><span className="eyebrow">RISK & HEALTH CENTRE</span><h3>Your money vitals</h3></div><ScoreRing value={metrics.healthScore} /></div><div className="drivers"><h4>What is moving your score</h4>{metrics.riskDrivers.map((driver, index) => <div key={driver}><span className={index === 0 ? 'amber-dot' : 'mint-dot'}>{index + 1}</span><p>{driver}</p></div>)}</div><div className="health-bars">{Object.entries(metrics.healthBreakdown).map(([label, value]) => <div key={label}><span>{label}<b>{value}</b></span><i role="progressbar" aria-label={`${label} score`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><em style={{ width: `${value}%` }} /></i></div>)}</div></article>
}

function CashflowCalendar({ state }: { state: FinanceState }) {
  const items = [...state.incomes.filter(item => !item.paid).map(item => ({ ...item, type: 'income' })), ...state.commitments.filter(item => !item.paid).map(item => ({ ...item, type: 'bill' })), ...state.subscriptions.filter(item => item.active && !item.paid).map(item => ({ ...item, type: 'sub' }))].sort((a, b) => a.day - b.day)
  return <article className="panel cashflow-list"><div className="section-title"><div><span className="eyebrow">UPCOMING</span><h3>Cashflow calendar</h3></div><CalendarDays /></div>{items.length ? items.map(item => <div className="cashflow-item" key={item.id}><span className={item.type}>{item.type === 'income' ? <ArrowUpRight /> : item.type === 'sub' ? <RefreshCcw /> : <CreditCard />}</span><div><b>{item.title}</b><small>Day {item.day} • {Math.max(0, item.day - state.day)} days away</small></div><strong className={item.type}>{item.type === 'income' ? '+' : '−'}{inr(item.amount)}</strong></div>) : <p className="empty-state">No unpaid commitments remain this month.</p>}</article>
}

export default function ForecastPage() {
  const finance = useFinanceStore(state => state.finance)
  const metrics = useMemo(() => calculateMetrics(finance), [finance])
  return <div className="page-pad"><div className="page-heading"><div><span className="eyebrow">30-DAY LIQUIDITY MODEL</span><h1>Know the squeeze <span>before it hits.</span></h1><p>Forecast bands are honest ranges, not false precision.</p></div><RiskBadge metrics={metrics} /></div><div className="forecast-kpis"><article><span>Expected on Day 30</span><strong>{inr(metrics.endBalance)}</strong><small>{metrics.endBalance >= 0 ? 'Month survives' : 'Deficit projected'}</small></article><article><span>Best-case runway</span><strong>{inr(metrics.forecast.at(-1)?.best ?? 0)}</strong><small>If discretionary spend falls 28%</small></article><article><span>Worst-case floor</span><strong className="coral-text">{inr(metrics.forecast.at(-1)?.worst ?? 0)}</strong><small>Includes all surprise costs</small></article><article><span>Runway</span><strong>{metrics.runway} days</strong><small>{metrics.daysRemaining} days still to cover</small></article></div><section className="panel full-chart-panel"><div className="section-title"><div><span className="eyebrow">PROBABILISTIC CASHFLOW ENVELOPE</span><h3>₹10,000 month trajectory</h3></div><div className="legend"><span><i className="mint-bg" />Expected</span><span><i className="purple-bg" />Best</span><span><i className="coral-bg" />Worst</span></div></div><div className="chart-wrap full-chart"><ForecastChart data={metrics.forecast} full /></div></section><section className="forecast-lower"><RiskCenter metrics={metrics} /><CashflowCalendar state={finance} /></section></div>
}
