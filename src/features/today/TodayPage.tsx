import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowRight, ArrowUpRight, BadgeIndianRupee, Coffee, CreditCard, Dumbbell, Gauge, HeartPulse, Lightbulb, Music2, Plane, Play, Plus, RotateCcw, ShieldCheck, Sparkles, TrendingUp, Tv, WalletCards, Zap } from 'lucide-react'
import ForecastChart from '../../components/ForecastChart'
import { AnimatedMoney, RiskBadge, ScoreRing } from '../../components/ui/FinancialVisuals'
import { calculateMetrics } from '../../engine/engine'
import type { Category, Decision, FinanceState, Metrics } from '../../engine/types'
import { inr, pct } from '../../lib/format'
import { useFinanceStore } from '../../store/useFinanceStore'
import type { Page } from '../../app/navigation'

function Hero({ metrics, setPage }: { metrics: Metrics; setPage: (page: Page) => void }) {
  return <section className="hero-section"><div className="hero-copy"><span className="eyebrow"><span className="pulse" /> LIVE 30-DAY MONEY RUN</span><h1>Make your <span>₹10K</span> last.<br />Before life happens.</h1><p>See the ripple before you spend. RupeePulse connects today’s choices to your month-end balance, goals, risk and peace of mind.</p><div className="hero-actions"><button className="primary-button" onClick={() => setPage('simulator')} data-testid="simulate-button"><Sparkles size={18} /> Try a “what if?” <ArrowRight size={17} /></button><span><ShieldCheck size={16} /> 100% private • runs in your browser</span></div></div><div className="hero-orbit" aria-label={`Current balance ${inr(metrics.balance)}, safe spend ${inr(metrics.safeAllowance)} per day`}><div className="orbit-glow" /><div className="hero-balance"><small>Your runway</small><b><AnimatedMoney value={metrics.balance} /></b><span>{metrics.daysRemaining} days left</span></div><div className="float-card float-one"><div><Zap size={17} /> Safe today</div><strong>{inr(metrics.safeAllowance)}</strong></div><div className="float-card float-two"><div><Activity size={17} /> Health</div><strong>{metrics.healthScore}<small>/100</small></strong></div><div className="float-card float-three"><RiskBadge metrics={metrics} /></div></div></section>
}

function MetricGrid({ metrics }: { metrics: Metrics }) {
  return <section className="metric-grid" aria-label="Your financial snapshot">
    <article className="metric-card" data-testid="balance"><div className="metric-top"><span className="metric-icon mint"><WalletCards /></span><span className="micro-positive"><ArrowUpRight /> ₹1,500 due</span></div><p>Remaining balance</p><h2><AnimatedMoney value={metrics.balance} /></h2><div className="progress" role="progressbar" aria-label="Budget remaining" aria-valuenow={Math.max(0, Math.round(metrics.balance / 100))} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${Math.max(0, metrics.balance / 100)}%` }} /></div><small>{pct(metrics.balance / 100)} of your ₹10,000 base remains</small></article>
    <article className="metric-card" data-testid="daily-allowance"><div className="metric-top"><span className="metric-icon purple"><BadgeIndianRupee /></span><span className="safe-label">SAFE ZONE</span></div><p>Safe to spend today</p><h2 className="mint-text"><AnimatedMoney value={metrics.safeAllowance} /><em>/day</em></h2><div className="formula-row"><span>Flexible pool</span><b>{inr(metrics.safePool)}</b></div><small>After bills, goals and a {inr(700)} buffer</small></article>
    <article className="metric-card health-card" data-testid="health-score"><div className="metric-top"><span className="metric-icon mint"><HeartPulse /></span><span className="safe-label">LIVE SCORE</span></div><p>Financial health</p><div className="metric-ring-row"><ScoreRing value={metrics.healthScore} /><div><b>{metrics.healthScore >= 75 ? 'Good rhythm' : 'Needs attention'}</b><small>Your daily choices update this score instantly.</small></div></div></article>
    <article className="metric-card"><div className="metric-top"><span className="metric-icon amber"><Gauge /></span><RiskBadge metrics={metrics} /></div><p>Risk & runway</p><h2>{metrics.runway}<em> days</em></h2><div className="progress risk-progress" role="progressbar" aria-label="Runway coverage" aria-valuenow={Math.min(100, Math.round(metrics.runway / metrics.daysRemaining * 100))} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${Math.min(100, metrics.runway / metrics.daysRemaining * 100)}%` }} /></div><small>{metrics.riskDrivers[1]}</small></article>
  </section>
}

function MiniForecast({ metrics, onOpen }: { metrics: Metrics; onOpen: () => void }) {
  const sampled = metrics.forecast.filter((_, index) => index % 3 === 0 || index === metrics.forecast.length - 1)
  return <article className="panel forecast-mini deferred-section"><div className="section-title"><div><span className="eyebrow">RUNWAY TRAJECTORY</span><h3>Where your money lands</h3></div><button className="text-button" onClick={onOpen}>Full forecast <ArrowRight /></button></div><div className="chart-wrap mini-chart"><ForecastChart data={sampled} /></div><div className="forecast-caption"><span><i className="legend-dot mint-bg" /> Expected</span><b>{metrics.endBalance >= 0 ? `${inr(metrics.endBalance)} on Day 30` : `${inr(metrics.endBalance)} short`}</b></div></article>
}

function QuickAdd() {
  const { finance, commit, undoState, undo } = useFinanceStore()
  const [kind, setKind] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('Food')
  const [error, setError] = useState('')
  const add = () => {
    const parsed = Math.min(10_000_000, Number(amount))
    if (!title.trim()) { setError('Add a short description.'); return }
    if (!Number.isFinite(parsed) || parsed <= 0) { setError('Enter an amount greater than zero.'); return }
    const safeTitle = title.trim().replace(/[<>]/g, '').slice(0, 60)
    const decision: Decision = kind === 'expense' ? { type: 'expense', title: safeTitle, amount: parsed, category } : { type: 'income', title: safeTitle, amount: parsed }
    commit(decision, `${kind === 'expense' ? 'Expense' : 'Income'} added. Your full money picture is updated.`)
    setAmount(''); setTitle(''); setError('')
  }
  return <article className="panel ledger-panel deferred-section"><div className="section-title"><div><span className="eyebrow">LIVE LEDGER</span><h3>Quick add</h3></div><div className="segmented" role="group" aria-label="Transaction type"><button aria-pressed={kind === 'expense'} className={kind === 'expense' ? 'active' : ''} onClick={() => setKind('expense')}>Expense</button><button aria-pressed={kind === 'income'} className={kind === 'income' ? 'active' : ''} onClick={() => setKind('income')}>Income</button></div></div><div className="quick-form"><label className="money-input"><span>₹</span><input aria-label="Amount" aria-invalid={Boolean(error && (!amount || Number(amount) <= 0))} inputMode="decimal" placeholder="0" value={amount} onChange={event => { setAmount(event.target.value); setError('') }} /></label><input aria-label="Transaction title" aria-invalid={Boolean(error && !title.trim())} placeholder="What was it for?" value={title} onChange={event => { setTitle(event.target.value); setError('') }} onKeyDown={event => event.key === 'Enter' && add()} />{kind === 'expense' && <select aria-label="Category" value={category} onChange={event => setCategory(event.target.value as Category)}><option>Food</option><option>Transport</option><option>Shopping</option><option>Bills</option><option>Health</option><option>Other</option></select>}<button className="primary-button compact" onClick={add}><Plus /> Add</button></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="transaction-list">{finance.transactions.slice(0, 5).map(tx => <div className="transaction" key={tx.id}><span className={`transaction-icon ${tx.kind}`}>{tx.category === 'Food' ? <Coffee /> : tx.kind === 'income' ? <TrendingUp /> : <CreditCard />}</span><div><b>{tx.title}</b><small>{tx.category} • Day {tx.day}</small></div><strong className={tx.kind}>{tx.kind === 'income' ? '+' : '−'}{inr(tx.amount)}</strong></div>)}</div>{undoState && <button className="undo-button" onClick={undo}><RotateCcw /> Undo last change</button>}</article>
}

function EventCard() {
  const { finance, commit } = useFinanceStore()
  const event = finance.events.find(item => item.day <= finance.day && !item.handled)
  if (!event) return <article className="panel calm-panel deferred-section"><ShieldCheck /><div><span className="eyebrow">ALL CLEAR TODAY</span><h3>No surprise expenses waiting</h3><p>Your buffer can keep doing its quiet work.</p></div></article>
  return <article className="panel event-panel deferred-section"><div className="event-head"><span className="event-icon"><AlertTriangle /></span><div><span className="eyebrow coral">UNEXPECTED • DAY {event.day}</span><h3>{event.title}</h3><p>{event.description}</p></div><strong>{inr(event.amount)}</strong></div><div className="event-options"><button onClick={() => commit({ type: 'handle-event', eventId: event.id, strategy: 'buffer' }, 'Covered from buffer. Your daily spend is protected, but resilience dropped.')}><ShieldCheck /><span><b>Use buffer</b><small>Protect daily spend</small></span></button><button onClick={() => commit({ type: 'handle-event', eventId: event.id, strategy: 'goal' }, 'Used Goa savings. Cashflow stays steady; goal date moves back.')}><Plane /><span><b>Dip into goal</b><small>Delay the trip</small></span></button><button onClick={() => commit({ type: 'handle-event', eventId: event.id, strategy: 'spend' }, 'Paid now. Your safe daily amount and forecast have dropped.')}><WalletCards /><span><b>Pay from balance</b><small>Feel it daily</small></span></button></div></article>
}

function GoalCard({ state, metrics }: { state: FinanceState; metrics: Metrics }) {
  const goal = state.goals[0]; const progress = goal.saved / goal.target * 100; const dailyNeeded = Math.max(0, (goal.target - goal.saved) / Math.max(1, goal.deadlineDay - state.day))
  return <article className="panel goal-card deferred-section"><div className="section-title"><div><span className="eyebrow">PRIORITY GOAL</span><h3>{goal.emoji} {goal.title}</h3></div><span className={metrics.riskScore > 50 ? 'tag coral-tag' : 'tag'}>{metrics.riskScore > 50 ? 'AT RISK' : 'CATCHABLE'}</span></div><div className="goal-amount"><strong>{inr(goal.saved)}</strong><span>of {inr(goal.target)}</span><b>{pct(progress)}</b></div><div className="progress large" role="progressbar" aria-label={`${goal.title} progress`} aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${progress}%` }} /></div><div className="goal-meta"><span><small>Need per day</small><b>{inr(dailyNeeded)}</b></span><span><small>Projected finish</small><b>Day {metrics.riskScore > 50 ? 34 : 29}</b></span></div></article>
}

function SubscriptionPeek({ setPage }: { setPage: (page: Page) => void }) {
  const finance = useFinanceStore(state => state.finance); const active = finance.subscriptions.filter(subscription => subscription.active)
  return <article className="panel subs-peek deferred-section"><div className="section-title"><div><span className="eyebrow">LEAK WATCHER</span><h3>Recurring spend</h3></div><b>{inr(active.reduce((sum, item) => sum + item.amount, 0))}/mo</b></div>{active.slice(0, 3).map(item => <div className="mini-sub" key={item.id}><span>{item.icon === 'music' ? <Music2 /> : item.icon === 'tv' ? <Tv /> : <Dumbbell />}</span><div><b>{item.title}</b><small>Day {item.day}</small></div><strong>{inr(item.amount)}</strong></div>)}<button className="text-button wide-link" onClick={() => setPage('plans')}>Audit subscriptions <ArrowRight /></button></article>
}

function MoneyPulse({ finance, metrics }: { finance: FinanceState; metrics: Metrics }) {
  const foodSpend = finance.transactions.filter(item => item.kind === 'expense' && item.category === 'Food').reduce((sum, item) => sum + item.amount, 0)
  const totalSpend = finance.transactions.filter(item => item.kind === 'expense').reduce((sum, item) => sum + item.amount, 0)
  const noSpendDays = Math.max(0, finance.day - new Set(finance.transactions.filter(item => item.kind === 'expense').map(item => item.day)).size)
  return <article className="panel insight-card money-pulse deferred-section"><Lightbulb /><span className="eyebrow">BEHAVIOURAL MONEY PULSE</span><h3>{noSpendDays} no-spend days earned</h3><p>Food makes up {pct(totalSpend ? foodSpend / totalSpend * 100 : 0)} of logged spending. Your strongest lever now is keeping flexible spend under {inr(metrics.safeAllowance)} today.</p><div className="pulse-badges"><span>🔥 {noSpendDays}-day discipline</span><span>🛡️ {metrics.riskLevel} risk</span></div></article>
}

function MonthRecap({ finance, metrics }: { finance: FinanceState; metrics: Metrics }) {
  if (finance.day < 30) return null
  return <section className="panel month-recap" aria-labelledby="recap-title"><span className="eyebrow">MONTH COMPLETE</span><h2 id="recap-title">Your ₹10K survival story</h2><div className="recap-grid"><div><strong>{inr(metrics.balance)}</strong><span>Closing balance</span></div><div><strong>{metrics.healthScore}/100</strong><span>Financial health</span></div><div><strong>{metrics.riskLevel}</strong><span>Final risk</span></div></div><p>{metrics.balance >= 0 ? 'You finished above zero. Protect the habits that kept your runway intact.' : 'You found the pressure points. Re-run the month and test a stronger subscription and food plan.'}</p></section>
}

export default function TodayPage({ setPage }: { setPage: (page: Page) => void }) {
  const finance = useFinanceStore(state => state.finance)
  const metrics = useMemo(() => calculateMetrics(finance), [finance])
  return <><Hero metrics={metrics} setPage={setPage} /><MetricGrid metrics={metrics} /><MonthRecap finance={finance} metrics={metrics} /><section className="dashboard-grid"><div className="main-column"><article className="panel simulator-launch"><span className="sim-icon"><Sparkles /></span><div><span className="eyebrow">DECISION LAB</span><h3>Craving a ₹550 pizza tonight?</h3><p>Test the choice first. See what changes across your whole month — before a single rupee leaves.</p></div><button className="primary-button" onClick={() => setPage('simulator')}><Play /> Simulate it</button></article><EventCard /><QuickAdd /></div><aside className="side-column"><MiniForecast metrics={metrics} onOpen={() => setPage('forecast')} /><GoalCard state={finance} metrics={metrics} /><MoneyPulse finance={finance} metrics={metrics} /><SubscriptionPeek setPage={setPage} /></aside></section></>
}
