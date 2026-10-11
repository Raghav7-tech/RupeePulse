import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeIndianRupee,
  BarChart3, BellRing, CalendarDays, Check, ChevronRight, CircleDollarSign, Cloud,
  Coffee, CreditCard, Dumbbell, FastForward, Gauge, HeartPulse, Home, Lightbulb,
  Menu, Moon, Music2, Plane, Play, Plus, RefreshCcw, RotateCcw, ShieldCheck,
  Sparkles, Target, TrendingDown, TrendingUp, Tv, WalletCards, X, Zap,
} from 'lucide-react'
import {
  Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { calculateMetrics, simulate } from './engine/engine'
import type { Category, Decision, FinanceState, Metrics, SimulationResult, Subscription } from './engine/types'
import { inr, pct } from './lib/format'
import { useFinanceStore } from './store/useFinanceStore'

type Page = 'today' | 'simulator' | 'forecast' | 'plans'

const navItems: { id: Page; label: string; short: string; icon: typeof Home }[] = [
  { id: 'today', label: 'Today', short: 'Today', icon: Home },
  { id: 'simulator', label: 'Decision Lab', short: 'Simulate', icon: Sparkles },
  { id: 'forecast', label: 'Forecast', short: 'Forecast', icon: BarChart3 },
  { id: 'plans', label: 'Plans & Goals', short: 'Plans', icon: Target },
]

const MotionNumber = ({ value, prefix = '₹' }: { value: number; prefix?: string }) => (
  <motion.span key={value} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>
    {prefix}{Math.round(value).toLocaleString('en-IN')}
  </motion.span>
)

const RiskBadge = ({ metrics }: { metrics: Metrics }) => (
  <span className={`risk-badge risk-${metrics.riskLevel.toLowerCase()}`} data-testid="risk-level">
    <span className="status-dot" />{metrics.riskLevel} risk
  </span>
)

const Ring = ({ value, label, color = 'mint' }: { value: number; label?: string; color?: 'mint' | 'purple' | 'amber' }) => (
  <div className={`ring ring-${color}`} style={{ '--score': value } as React.CSSProperties}>
    <div className="ring-inner"><strong>{value}</strong><span>{label ?? '/100'}</span></div>
  </div>
)

function Header({ page, setPage }: { page: Page; setPage: (p: Page) => void }) {
  const { finance, nextDay, reset, jumpToDay } = useFinanceStore()
  const metrics = calculateMetrics(finance)
  const [menu, setMenu] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || finance.day >= 30) { if (finance.day >= 30) setPlaying(false); return }
    const timer = window.setTimeout(nextDay, 440)
    return () => window.clearTimeout(timer)
  }, [playing, finance.day, nextDay])

  return <>
    <header className="topbar">
      <div className="nav-shell">
        <button className="brand" onClick={() => setPage('today')} aria-label="RupeePulse home">
          <span className="brand-mark"><TrendingUp size={21} /></span>
          <span><b>Rupee<span>Pulse</span></b><small>₹10K • 30 days</small></span>
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>{item.label}</button>)}
        </nav>
        <div className="nav-actions">
          <div className="day-pill"><span className="pulse" /> Day {finance.day}<span>/30</span></div>
          <button className="icon-label next" onClick={nextDay} disabled={finance.day >= 30} data-testid="next-day-button"><FastForward size={15} /><span>Next day</span></button>
          <button className={`icon-label autoplay ${playing ? 'on' : ''}`} onClick={() => setPlaying(!playing)}><Play size={14} fill="currentColor" /><span>{playing ? 'Pause' : 'Auto'}</span></button>
          <div className="balance-mini"><span>Balance</span><b>{inr(metrics.balance)}</b></div>
          <button className="icon-button desktop-only" aria-label="Reset scenario" onClick={reset} data-testid="reset-button"><RotateCcw size={17} /></button>
          <button className="icon-button menu-button" aria-label="Open menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </div>
    </header>
    <AnimatePresence>{menu && <motion.div className="mobile-menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      {navItems.map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => { setPage(item.id); setMenu(false) }}><item.icon size={18} />{item.label}</button>)}
      <div className="mobile-menu-actions"><button onClick={reset}><RotateCcw size={16} /> Reset</button><label>Jump to day <input type="number" min="8" max="30" value={finance.day} onChange={e => jumpToDay(Number(e.target.value))} /></label></div>
    </motion.div>}</AnimatePresence>
  </>
}

function Hero({ metrics, setPage }: { metrics: Metrics; setPage: (p: Page) => void }) {
  return <section className="hero-section">
    <div className="hero-copy">
      <span className="eyebrow"><span className="pulse" /> LIVE 30-DAY MONEY RUN</span>
      <h1>Make your <span>₹10K</span> last.<br />Before life happens.</h1>
      <p>See the ripple before you spend. RupeePulse connects today’s choices to your month-end balance, goals, risk and peace of mind.</p>
      <div className="hero-actions">
        <button className="primary-button" onClick={() => setPage('simulator')} data-testid="simulate-button"><Sparkles size={18} /> Try a “what if?” <ArrowRight size={17} /></button>
        <span><ShieldCheck size={16} /> 100% private • runs in your browser</span>
      </div>
    </div>
    <div className="hero-orbit" aria-label={`Current balance ${inr(metrics.balance)}, safe spend ${inr(metrics.safeAllowance)} per day`}>
      <div className="orbit-glow" />
      <div className="hero-balance"><small>Your runway</small><b><MotionNumber value={metrics.balance} /></b><span>{metrics.daysRemaining} days left</span></div>
      <div className="float-card float-one"><div><Zap size={17} /> Safe today</div><strong>{inr(metrics.safeAllowance)}</strong></div>
      <div className="float-card float-two"><div><Activity size={17} /> Health</div><strong>{metrics.healthScore}<small>/100</small></strong></div>
      <div className="float-card float-three"><RiskBadge metrics={metrics} /></div>
    </div>
  </section>
}

function MetricGrid({ metrics }: { metrics: Metrics }) {
  return <section className="metric-grid" aria-label="Your financial snapshot">
    <article className="metric-card" data-testid="balance">
      <div className="metric-top"><span className="metric-icon mint"><WalletCards /></span><span className="micro-positive"><ArrowUpRight /> ₹1,500 due</span></div>
      <p>Remaining balance</p><h2><MotionNumber value={metrics.balance} /></h2>
      <div className="progress"><i style={{ width: `${Math.max(0, metrics.balance / 100)}%` }} /></div>
      <small>{pct(metrics.balance / 100)} of your ₹10,000 base remains</small>
    </article>
    <article className="metric-card" data-testid="daily-allowance">
      <div className="metric-top"><span className="metric-icon purple"><BadgeIndianRupee /></span><span className="safe-label">SAFE ZONE</span></div>
      <p>Safe to spend today</p><h2 className="mint-text"><MotionNumber value={metrics.safeAllowance} /><em>/day</em></h2>
      <div className="formula-row"><span>Flexible pool</span><b>{inr(metrics.safePool)}</b></div>
      <small>After bills, goals and a {inr(700)} buffer</small>
    </article>
    <article className="metric-card health-card" data-testid="health-score">
      <div className="metric-top"><span className="metric-icon mint"><HeartPulse /></span><span className="safe-label">STABLE</span></div>
      <p>Financial health</p><div className="metric-ring-row"><Ring value={metrics.healthScore} /><div><b>Good rhythm</b><small>Your consistency is doing the heavy lifting.</small></div></div>
    </article>
    <article className="metric-card">
      <div className="metric-top"><span className="metric-icon amber"><Gauge /></span><RiskBadge metrics={metrics} /></div>
      <p>Risk & runway</p><h2>{metrics.runway}<em> days</em></h2>
      <div className="progress risk-progress"><i style={{ width: `${Math.min(100, metrics.runway / metrics.daysRemaining * 100)}%` }} /></div>
      <small>{metrics.riskDrivers[1]}</small>
    </article>
  </section>
}

function MiniForecast({ metrics, onOpen }: { metrics: Metrics; onOpen: () => void }) {
  const sampled = metrics.forecast.filter((_, i) => i % 3 === 0 || i === metrics.forecast.length - 1)
  return <article className="panel forecast-mini">
    <div className="section-title"><div><span className="eyebrow">RUNWAY TRAJECTORY</span><h3>Where your money lands</h3></div><button className="text-button" onClick={onOpen}>Full forecast <ArrowRight /></button></div>
    <div className="chart-wrap mini-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampled} margin={{ top: 10, right: 3, left: -28, bottom: 0 }}>
          <defs><linearGradient id="mintFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00e6a4" stopOpacity={.28}/><stop offset="100%" stopColor="#00e6a4" stopOpacity={0}/></linearGradient></defs>
          <CartesianGrid strokeDasharray="3 6" stroke="#27313d" vertical={false}/><XAxis dataKey="day" tickFormatter={d => `D${d}`} tick={{ fill: '#738091', fontSize: 11 }} axisLine={false} tickLine={false}/><YAxis tick={{ fill: '#738091', fontSize: 10 }} axisLine={false} tickLine={false}/>
          <Area type="monotone" dataKey="expected" stroke="#00e6a4" strokeWidth={2.5} fill="url(#mintFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="forecast-caption"><span><i className="legend-dot mint-bg" /> Expected</span><b>{metrics.endBalance >= 0 ? `${inr(metrics.endBalance)} on Day 30` : `${inr(metrics.endBalance)} short`}</b></div>
  </article>
}

function QuickAdd() {
  const { finance, commit, undoState, undo } = useFinanceStore()
  const [kind, setKind] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('Food')
  const add = () => {
    const parsed = Number(amount)
    if (!title.trim() || !Number.isFinite(parsed) || parsed <= 0) return
    const decision: Decision = kind === 'expense' ? { type: 'expense', title, amount: parsed, category } : { type: 'income', title, amount: parsed }
    commit(decision, `${kind === 'expense' ? 'Expense' : 'Income'} added. Your full money picture is updated.`)
    setAmount(''); setTitle('')
  }
  return <article className="panel ledger-panel">
    <div className="section-title"><div><span className="eyebrow">LIVE LEDGER</span><h3>Quick add</h3></div><div className="segmented"><button className={kind === 'expense' ? 'active' : ''} onClick={() => setKind('expense')}>Expense</button><button className={kind === 'income' ? 'active' : ''} onClick={() => setKind('income')}>Income</button></div></div>
    <div className="quick-form">
      <label className="money-input"><span>₹</span><input aria-label="Amount" inputMode="numeric" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} /></label>
      <input aria-label="Transaction title" placeholder="What was it for?" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} />
      {kind === 'expense' && <select aria-label="Category" value={category} onChange={e => setCategory(e.target.value as Category)}><option>Food</option><option>Transport</option><option>Shopping</option><option>Bills</option><option>Health</option><option>Other</option></select>}
      <button className="primary-button compact" onClick={add}><Plus /> Add</button>
    </div>
    <div className="transaction-list">
      {finance.transactions.slice(0, 5).map(tx => <div className="transaction" key={tx.id}>
        <span className={`transaction-icon ${tx.kind}`}>{tx.category === 'Food' ? <Coffee /> : tx.kind === 'income' ? <TrendingUp /> : <CreditCard />}</span>
        <div><b>{tx.title}</b><small>{tx.category} • Day {tx.day}</small></div>
        <strong className={tx.kind}>{tx.kind === 'income' ? '+' : '−'}{inr(tx.amount)}</strong>
      </div>)}
    </div>
    {undoState && <button className="undo-button" onClick={undo}><RotateCcw /> Undo last change</button>}
  </article>
}

function EventCard() {
  const { finance, commit } = useFinanceStore()
  const event = finance.events.find(e => e.day <= finance.day && !e.handled)
  if (!event) return <article className="panel calm-panel"><ShieldCheck /><div><span className="eyebrow">ALL CLEAR TODAY</span><h3>No surprise expenses waiting</h3><p>Your buffer can keep doing its quiet work.</p></div></article>
  return <article className="panel event-panel">
    <div className="event-head"><span className="event-icon"><AlertTriangle /></span><div><span className="eyebrow coral">UNEXPECTED • DAY {event.day}</span><h3>{event.title}</h3><p>{event.description}</p></div><strong>{inr(event.amount)}</strong></div>
    <div className="event-options">
      <button onClick={() => commit({ type: 'handle-event', eventId: event.id, strategy: 'buffer' }, 'Covered from buffer. Your daily spend is protected, but resilience dropped.')}><ShieldCheck /><span><b>Use buffer</b><small>Protect daily spend</small></span></button>
      <button onClick={() => commit({ type: 'handle-event', eventId: event.id, strategy: 'goal' }, 'Used Goa savings. Cashflow stays steady; goal date moves back.')}><Plane /><span><b>Dip into goal</b><small>Delay the trip</small></span></button>
      <button onClick={() => commit({ type: 'handle-event', eventId: event.id, strategy: 'spend' }, 'Paid now. Your safe daily amount and forecast have dropped.')}><WalletCards /><span><b>Pay from balance</b><small>Feel it daily</small></span></button>
    </div>
  </article>
}

function GoalCard({ state, metrics }: { state: FinanceState; metrics: Metrics }) {
  const goal = state.goals[0]
  const progress = goal.saved / goal.target * 100
  const dailyNeeded = Math.max(0, (goal.target - goal.saved) / Math.max(1, goal.deadlineDay - state.day))
  return <article className="panel goal-card">
    <div className="section-title"><div><span className="eyebrow">PRIORITY GOAL</span><h3>{goal.emoji} {goal.title}</h3></div><span className={metrics.riskScore > 50 ? 'tag coral-tag' : 'tag'}>{metrics.riskScore > 50 ? 'AT RISK' : 'CATCHABLE'}</span></div>
    <div className="goal-amount"><strong>{inr(goal.saved)}</strong><span>of {inr(goal.target)}</span><b>{pct(progress)}</b></div>
    <div className="progress large"><i style={{ width: `${progress}%` }} /></div>
    <div className="goal-meta"><span><small>Need per day</small><b>{inr(dailyNeeded)}</b></span><span><small>Projected finish</small><b>Day {metrics.riskScore > 50 ? 34 : 29}</b></span></div>
  </article>
}

function TodayPage({ setPage }: { setPage: (p: Page) => void }) {
  const finance = useFinanceStore(s => s.finance)
  const metrics = useMemo(() => calculateMetrics(finance), [finance])
  return <>
    <Hero metrics={metrics} setPage={setPage} />
    <MetricGrid metrics={metrics} />
    <section className="dashboard-grid">
      <div className="main-column">
        <article className="panel simulator-launch">
          <span className="sim-icon"><Sparkles /></span><div><span className="eyebrow">DECISION LAB</span><h3>Craving a ₹550 pizza tonight?</h3><p>Test the choice first. See what changes across your whole month — before a single rupee leaves.</p></div>
          <button className="primary-button" onClick={() => setPage('simulator')}><Play /> Simulate it</button>
        </article>
        <EventCard />
        <QuickAdd />
      </div>
      <aside className="side-column"><MiniForecast metrics={metrics} onOpen={() => setPage('forecast')} /><GoalCard state={finance} metrics={metrics} /><SubscriptionPeek setPage={setPage} /></aside>
    </section>
  </>
}

const presets: { label: string; detail: string; decision: Decision; tone: string }[] = [
  { label: 'Swiggy splurge', detail: '−₹450', decision: { type: 'expense', title: 'Impulse Swiggy splurge', amount: 450, category: 'Food' }, tone: 'bad' },
  { label: 'Cancel Cult.fit', detail: '+₹1,099 saved', decision: { type: 'cancel-subscription', subscriptionId: 's3' }, tone: 'good' },
  { label: 'Weekend party', detail: '−₹1,800', decision: { type: 'expense', title: 'Weekend party outing', amount: 1800, category: 'Other' }, tone: 'bad' },
  { label: 'Design gig', detail: '+₹2,500', decision: { type: 'income', title: 'Design gig', amount: 2500 }, tone: 'good' },
  { label: 'Phone screen repair', detail: '−₹1,200', decision: { type: 'expense', title: 'Phone screen repair', amount: 1200, category: 'Other' }, tone: 'bad' },
]

function ComparisonMetric({ label, before, after, delta, format = inr }: { label: string; before: number; after: number; delta: number; format?: (v: number) => string }) {
  const good = label.toLowerCase().includes('risk') ? delta <= 0 : delta >= 0
  return <div className="compare-card"><div className="compare-label"><span>{label}</span><b className={good ? 'delta good' : 'delta bad'}>{delta > 0 ? '+' : ''}{delta}</b></div><div className="before-after"><span><small>Now</small><s>{format(before)}</s></span><ArrowRight /><span><small>After</small><strong>{format(after)}</strong></span></div></div>
}

function SimulatorPage({ initial }: { initial?: Decision }) {
  const { finance, commit } = useFinanceStore()
  const [decision, setDecision] = useState<Decision>(initial ?? presets[0].decision)
  const [title, setTitle] = useState('Impulse Swiggy splurge')
  const [amount, setAmount] = useState(450)
  const [kind, setKind] = useState<'expense' | 'income'>('expense')
  const [result, setResult] = useState<SimulationResult>(() => simulate(finance, decision))

  useEffect(() => setResult(simulate(finance, decision)), [finance, decision])
  const recalc = () => setDecision(kind === 'expense' ? { type: 'expense', title, amount, category: 'Food' } : { type: 'income', title, amount })
  const verdict = result.delta.risk > 5
    ? `This choice raises your risk to ${result.after.riskLevel} and removes ${inr(Math.abs(result.delta.allowance))} from each day.`
    : result.delta.allowance > 0
      ? `This adds ${inr(result.delta.allowance)} to every remaining day and keeps the Goa goal closer.`
      : `You can absorb this, but it trims ${inr(Math.abs(result.delta.allowance))} from your daily flexibility.`

  return <div className="page-pad simulator-page">
    <div className="page-heading"><div><span className="eyebrow">ZERO-RISK SANDBOX</span><h1>Test the choice. <span>See the ripple.</span></h1><p>Your real balance stays untouched until you confirm.</p></div><div className="sandbox-chip"><span className="pulse" /><span>Sandbox reality</span><b>{inr(finance.budget)} runway</b></div></div>
    <div className="sim-layout">
      <div className="sim-controls">
        <section className="panel"><div className="section-title"><h3>Scenario presets</h3><span className="tag">QUICK LOAD</span></div><div className="preset-list">{presets.map(p => <button key={p.label} className={decision.type === p.decision.type && 'title' in decision && decision.title === ('title' in p.decision ? p.decision.title : '') ? 'active' : ''} onClick={() => { setDecision(p.decision); if ('amount' in p.decision) setAmount(p.decision.amount); if ('title' in p.decision) setTitle(p.decision.title) }}><span>{p.label}</span><b className={p.tone}>{p.detail}</b><ChevronRight /></button>)}</div></section>
        <section className="panel custom-builder"><div className="section-title"><h3>Build a decision</h3><Sparkles /></div>
          <label>Decision name<input value={title} onChange={e => setTitle(e.target.value)} /></label>
          <label>Amount impact<div className="large-money-input"><span>₹</span><input type="number" min="1" value={amount} onChange={e => setAmount(Math.max(1, Number(e.target.value)))} /></div></label>
          <input aria-label="Decision amount slider" type="range" min="50" max="5000" step="50" value={amount} onChange={e => setAmount(Number(e.target.value))} />
          <div className="nature-grid"><button className={kind === 'expense' ? 'active' : ''} onClick={() => setKind('expense')}><ArrowDownRight /> Expense</button><button className={kind === 'income' ? 'active' : ''} onClick={() => setKind('income')}><ArrowUpRight /> Income</button></div>
          <button className="primary-button wide" onClick={recalc} data-testid="simulate-button"><Play /> Recalculate ripple</button>
        </section>
        <div className="principle"><Lightbulb /><p><b>Your bank balance is only the first domino.</b><br/>RupeePulse traces what happens next.</p></div>
      </div>
      <section className="panel ripple-panel" aria-live="polite">
        <div className="section-title"><div><span className="eyebrow">REAL-TIME COMPARISON</span><h3>One choice, six consequences</h3></div><span className="tag">DAY {finance.day} STATE</span></div>
        <div className="comparison-grid">
          <ComparisonMetric label="Remaining balance" before={result.before.balance} after={result.after.balance} delta={result.delta.balance} />
          <ComparisonMetric label="Safe daily spend" before={result.before.safeAllowance} after={result.after.safeAllowance} delta={result.delta.allowance} />
          <ComparisonMetric label="Month-end forecast" before={result.before.endBalance} after={result.after.endBalance} delta={result.delta.endBalance} />
          <ComparisonMetric label="Risk score" before={result.before.riskScore} after={result.after.riskScore} delta={result.delta.risk} format={v => `${v}/100`} />
          <ComparisonMetric label="Health score" before={result.before.healthScore} after={result.after.healthScore} delta={result.delta.health} format={v => `${v}/100`} />
          <div className="compare-card goal-impact"><div className="compare-label"><span>Goa goal</span><b className={result.delta.allowance < 0 ? 'delta bad' : 'delta good'}>{result.delta.allowance < 0 ? 'DELAYED' : 'FASTER'}</b></div><div className="before-after"><span><small>Expected</small><s>Day 29</s></span><ArrowRight /><span><small>After</small><strong>Day {29 + Math.max(0, Math.ceil(Math.abs(result.delta.allowance) / 5))}</strong></span></div></div>
        </div>
        <div className="ripple-chain"><span className={result.delta.balance < 0 ? 'bad-node' : 'good-node'}>{result.delta.balance < 0 ? <Coffee /> : <TrendingUp />}<b>{inr(result.delta.balance, true)}</b><small>Choice</small></span><ArrowRight/><span><BadgeIndianRupee/><b>{inr(result.after.safeAllowance)}</b><small>Daily</small></span><ArrowRight/><span><ShieldCheck/><b>{result.after.runway}d</b><small>Runway</small></span><ArrowRight/><span><Plane/><b>Day {29 + Math.max(0, Math.ceil(Math.abs(result.delta.allowance) / 5))}</b><small>Goal ETA</small></span><ArrowRight/><span className={result.after.riskScore > 50 ? 'bad-node' : ''}><Gauge/><b>{result.after.riskLevel}</b><small>Risk</small></span></div>
        <div className={`verdict ${result.delta.risk > 5 ? 'warn' : ''}`}><Sparkles/><div><span>RupeePulse verdict</span><p>{verdict}</p></div></div>
        {result.delta.balance < -300 && <div className="alternative"><Lightbulb/><div><span>Smarter alternative</span><p>Cap this at {inr(Math.round(amount * .35))}; you keep roughly {inr(Math.abs(result.delta.allowance) * .65)} more per day.</p></div><button onClick={() => { setAmount(Math.round(amount * .35)); setDecision({ type: 'expense', title: `${title} — lighter option`, amount: Math.round(amount * .35), category: 'Food' }) }}>Apply</button></div>}
        <div className="sim-actions"><button className="secondary-button" onClick={() => setDecision({ type: 'expense', title: 'No spend', amount: 0, category: 'Other' })} data-testid="discard-button">Discard</button><button className="primary-button" onClick={() => commit(decision, 'Decision committed. Balance, forecast, risk, health and goals all recalculated.')} data-testid="confirm-button"><Check /> Confirm decision</button></div>
      </section>
    </div>
  </div>
}

function ForecastPage() {
  const finance = useFinanceStore(s => s.finance)
  const metrics = useMemo(() => calculateMetrics(finance), [finance])
  return <div className="page-pad">
    <div className="page-heading"><div><span className="eyebrow">30-DAY LIQUIDITY MODEL</span><h1>Know the squeeze <span>before it hits.</span></h1><p>Forecast bands are honest ranges, not false precision.</p></div><RiskBadge metrics={metrics} /></div>
    <div className="forecast-kpis">
      <article><span>Expected on Day 30</span><strong>{inr(metrics.endBalance)}</strong><small>{metrics.endBalance >= 0 ? 'Month survives' : 'Deficit projected'}</small></article>
      <article><span>Best-case runway</span><strong>{inr(metrics.forecast.at(-1)?.best ?? 0)}</strong><small>If discretionary spend falls 28%</small></article>
      <article><span>Worst-case floor</span><strong className="coral-text">{inr(metrics.forecast.at(-1)?.worst ?? 0)}</strong><small>Includes all surprise costs</small></article>
      <article><span>Runway</span><strong>{metrics.runway} days</strong><small>{metrics.daysRemaining} days still to cover</small></article>
    </div>
    <section className="panel full-chart-panel"><div className="section-title"><div><span className="eyebrow">PROBABILISTIC CASHFLOW ENVELOPE</span><h3>₹10,000 month trajectory</h3></div><div className="legend"><span><i className="mint-bg"/>Expected</span><span><i className="purple-bg"/>Best</span><span><i className="coral-bg"/>Worst</span></div></div>
      <div className="chart-wrap full-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={metrics.forecast} margin={{ top: 16, right: 16, left: 2, bottom: 0 }}><defs><linearGradient id="expectedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00e6a4" stopOpacity={.24}/><stop offset="100%" stopColor="#00e6a4" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="4 7" stroke="#26303a" vertical={false}/><XAxis dataKey="day" tickFormatter={d => `D${d}`} tick={{ fill:'#7f8b99',fontSize:11 }} axisLine={false}/><YAxis tickFormatter={v => `₹${v/1000}k`} tick={{ fill:'#7f8b99',fontSize:11 }} axisLine={false}/><Tooltip contentStyle={{ background:'#141b23',border:'1px solid #2b3541',borderRadius:12 }} formatter={(v) => inr(Number(v ?? 0))} labelFormatter={d => `Day ${d}`} /><Area type="monotone" dataKey="expected" stroke="#00e6a4" fill="url(#expectedFill)" strokeWidth={3}/><Line type="monotone" dataKey="best" stroke="#8b7dff" dot={false} strokeDasharray="5 5"/><Line type="monotone" dataKey="worst" stroke="#ff6b78" dot={false} strokeDasharray="5 5"/></AreaChart></ResponsiveContainer></div>
    </section>
    <section className="forecast-lower"><RiskCenter metrics={metrics}/><CashflowCalendar state={finance}/></section>
  </div>
}

function RiskCenter({ metrics }: { metrics: Metrics }) {
  return <article className="panel risk-center"><div className="section-title"><div><span className="eyebrow">RISK & HEALTH CENTRE</span><h3>Your money vitals</h3></div><Ring value={metrics.healthScore}/></div><div className="drivers"><h4>What is moving your score</h4>{metrics.riskDrivers.map((d, i) => <div key={d}><span className={i === 0 ? 'amber-dot' : 'mint-dot'}>{i + 1}</span><p>{d}</p></div>)}</div><div className="health-bars">{Object.entries(metrics.healthBreakdown).map(([label,value]) => <div key={label}><span>{label}<b>{value}</b></span><i><em style={{ width:`${value}%` }}/></i></div>)}</div></article>
}

function CashflowCalendar({ state }: { state: FinanceState }) {
  const items = [
    ...state.incomes.filter(x => !x.paid).map(x => ({...x, type:'income'})),
    ...state.commitments.filter(x => !x.paid).map(x => ({...x, type:'bill'})),
    ...state.subscriptions.filter(x => x.active && !x.paid).map(x => ({...x, type:'sub'})),
  ].sort((a,b) => a.day-b.day)
  return <article className="panel cashflow-list"><div className="section-title"><div><span className="eyebrow">UPCOMING</span><h3>Cashflow calendar</h3></div><CalendarDays /></div>{items.map(item => <div className="cashflow-item" key={item.id}><span className={item.type}>{item.type === 'income' ? <ArrowUpRight/> : item.type === 'sub' ? <RefreshCcw/> : <CreditCard/>}</span><div><b>{item.title}</b><small>Day {item.day} • {item.day-state.day} days away</small></div><strong className={item.type}>{item.type === 'income' ? '+' : '−'}{inr(item.amount)}</strong></div>)}</article>
}

function SubscriptionPeek({ setPage }: { setPage: (p: Page) => void }) {
  const finance = useFinanceStore(s => s.finance)
  const active = finance.subscriptions.filter(s => s.active)
  return <article className="panel subs-peek"><div className="section-title"><div><span className="eyebrow">LEAK WATCHER</span><h3>Recurring spend</h3></div><b>{inr(active.reduce((s,x)=>s+x.amount,0))}/mo</b></div>{active.slice(0,3).map(s => <div className="mini-sub" key={s.id}><span>{s.icon === 'music' ? <Music2/> : s.icon === 'tv' ? <Tv/> : <Dumbbell/>}</span><div><b>{s.title}</b><small>Day {s.day}</small></div><strong>{inr(s.amount)}</strong></div>)}<button className="text-button wide-link" onClick={() => setPage('plans')}>Audit subscriptions <ArrowRight/></button></article>
}

function SubIcon({ sub }: { sub: Subscription }) { return sub.icon === 'music' ? <Music2/> : sub.icon === 'tv' ? <Tv/> : sub.icon === 'cloud' ? <Cloud/> : <Dumbbell/> }

function PlansPage({ goSim }: { goSim: (decision: Decision) => void }) {
  const { finance, commit } = useFinanceStore()
  const metrics = calculateMetrics(finance)
  const active = finance.subscriptions.filter(s => s.active)
  const monthly = active.reduce((s,x)=>s+x.amount,0)
  return <div className="page-pad"><div className="page-heading"><div><span className="eyebrow">COMMITMENT AUDIT</span><h1>Stop silent leaks. <span>Fund what matters.</span></h1><p>Your recurring choices cost {inr(monthly * 12)} a year.</p></div><div className="sandbox-chip"><BellRing/><span>Auto-debit shield</span><b>48h alert</b></div></div>
    <div className="plan-kpis"><article><span>Monthly subscriptions</span><strong>{inr(monthly)}</strong><small>{pct(monthly/finance.budget*100)} of your base budget</small></article><article><span>Annualised drain</span><strong>{inr(monthly*12)}</strong><small>Worth a proper audit</small></article><article className="accent-kpi"><span>Possible daily unlock</span><strong>+{inr(Math.round(monthly/metrics.daysRemaining))}</strong><small>if all non-essential plans pause</small></article></div>
    <section className="plans-grid"><article className="panel subscriptions-panel"><div className="section-title"><div><span className="eyebrow">ACTIVE PLANS</span><h3>Subscription value check</h3></div><span className="tag">{active.length} ACTIVE</span></div><div className="subscription-table">{finance.subscriptions.map(sub => <div className={`subscription-row ${!sub.active ? 'cancelled' : ''}`} key={sub.id}><span className="sub-icon"><SubIcon sub={sub}/></span><div className="sub-name"><b>{sub.title}</b><small>Debits Day {sub.day}</small></div><strong>{inr(sub.amount)}<small>/mo</small></strong><div className="stars" aria-label={`${sub.worthIt} out of 5 value`}>{[1,2,3,4,5].map(n => <i key={n} className={n <= sub.worthIt ? 'filled' : ''}>★</i>)}</div>{sub.active ? <button className="secondary-button" onClick={() => goSim({ type:'cancel-subscription', subscriptionId:sub.id })}>Simulate cancel</button> : <span className="tag">PAUSED</span>}</div>)}</div></article>
      <aside className="plans-aside"><article className="panel goal-stack"><div className="section-title"><div><span className="eyebrow">SAVINGS GOALS</span><h3>Where future-you wins</h3></div><Target/></div>{finance.goals.map(goal => { const progress=goal.saved/goal.target*100; return <div className="stack-goal" key={goal.id}><div><span className="goal-emoji">{goal.emoji}</span><div><b>{goal.title}</b><small>{goal.priority} priority • Day {goal.deadlineDay}</small></div><strong>{pct(progress)}</strong></div><div className="progress"><i style={{width:`${progress}%`}}/></div><p>{inr(goal.saved)} saved of {inr(goal.target)}</p></div>})}<button className="primary-button wide" onClick={() => commit({type:'goal-contribution',goalId:'g1',amount:250},'₹250 moved to Goa. Daily flexibility fell, but goal confidence improved.')}><Plus/> Add ₹250 to Goa</button></article>
      <article className="panel insight-card"><Lightbulb/><span className="eyebrow">SMART NUDGE</span><h3>Netflix is your weakest-value plan</h3><p>You pay ₹199 but rated it 2/5. Cancelling adds roughly {inr(Math.round(199/metrics.daysRemaining))} to each remaining day.</p><button className="text-button" onClick={() => goSim({type:'cancel-subscription',subscriptionId:'s2'})}>See the ripple <ArrowRight/></button></article></aside>
    </section>
  </div>
}

function Toast() {
  const { toast, clearToast, undoState, undo } = useFinanceStore()
  useEffect(() => { if (!toast) return; const t=window.setTimeout(clearToast,4500); return()=>clearTimeout(t) }, [toast, clearToast])
  return <AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity:0,y:25 }} animate={{opacity:1,y:0}} exit={{opacity:0,y:15}} role="status"><span><Check/></span><p>{toast}</p>{undoState && <button onClick={undo}>Undo</button>}<button aria-label="Dismiss" onClick={clearToast}><X/></button></motion.div>}</AnimatePresence>
}

function Footer() { return <footer><div className="footer-grid"><div className="brand footer-brand"><span className="brand-mark"><TrendingUp/></span><span><b>Rupee<span>Pulse</span></b><small>Money clarity, without the lecture.</small></span></div><div><b><Zap/> One coupled engine</b><p>Every choice recalculates your complete month.</p></div><div><b><ShieldCheck/> Browser-private</b><p>No accounts, no bank link, no data leaving your device.</p></div><div><b><Sparkles/> Honest forecasts</b><p>Ranges, drivers and trade-offs — never fake certainty.</p></div></div><div className="footer-bottom"><span>Built for India’s financially ambitious Gen Z.</span><span>100% client-side • Demo data</span></div></footer> }

export function App() {
  const [page, setPage] = useState<Page>('today')
  const [simDecision, setSimDecision] = useState<Decision | undefined>()
  const goSim = (decision: Decision) => { setSimDecision(decision); setPage('simulator'); window.scrollTo({top:0,behavior:'smooth'}) }
  useEffect(() => { window.scrollTo({top:0,behavior:'smooth'}) }, [page])
  return <div className="app"><Header page={page} setPage={setPage}/><main>{page === 'today' && <TodayPage setPage={setPage}/>} {page === 'simulator' && <SimulatorPage initial={simDecision}/>} {page === 'forecast' && <ForecastPage/>} {page === 'plans' && <PlansPage goSim={goSim}/>}</main><Footer/><Toast/>
    <nav className="bottom-nav" aria-label="Mobile navigation">{navItems.map(item=><button key={item.id} className={page===item.id?'active':''} onClick={()=>setPage(item.id)}><item.icon/><span>{item.short}</span></button>)}</nav>
  </div>
}
