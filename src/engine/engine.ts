import type { Decision, FinanceState, ForecastPoint, Metrics, SimulationResult, Transaction } from './types'

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n))
const round = (n: number) => Math.round(n)
const safeAmount = (n: number) => Number.isFinite(n) ? clamp(Math.abs(n), 0, 10_000_000) : 0
const safeText = (value: string) => value.trim().replace(/[<>]/g, '').slice(0, 80) || 'Untitled decision'

export const getBalance = (state: FinanceState) => {
  const net = state.transactions.reduce((sum, t) => sum + (t.kind === 'income' ? t.amount : -t.amount), 0)
  return state.budget + net
}

export const getBurnRate = (state: FinanceState) => {
  const recent = state.transactions.filter(t => t.kind === 'expense' && t.day >= Math.max(1, state.day - 6))
  return recent.length ? recent.reduce((sum, t) => sum + t.amount, 0) / Math.min(7, state.day) : 0
}

const dueOutflows = (state: FinanceState, day = 30) => [
  ...state.commitments.filter(x => !x.paid && x.day <= day),
  ...state.subscriptions.filter(x => x.active && !x.paid && x.day <= day),
]

export const getCommittedRemaining = (state: FinanceState) => {
  const scheduled = dueOutflows(state).reduce((sum, x) => sum + x.amount, 0)
  const priorityGoalReserve = state.goals
    .filter(g => g.priority === 'High')
    .reduce((sum, g) => sum + Math.min(Math.max(0, g.target - g.saved), 800), 0)
  return scheduled + priorityGoalReserve
}

export const buildForecast = (state: FinanceState): ForecastPoint[] => {
  const current = getBalance(state)
  const burn = Math.max(90, getBurnRate(state) * 0.38)
  const unresolvedShock = state.events.filter(e => !e.handled && e.day > state.day)
  let expected = current
  let best = current
  let worst = current
  const points: ForecastPoint[] = [{ day: state.day, expected: round(expected), best: round(best), worst: round(worst), event: 'Today' }]

  for (let day = state.day + 1; day <= 30; day++) {
    expected -= burn
    best -= burn * 0.72
    worst -= burn * 1.3
    let label: string | undefined
    state.incomes.filter(x => !x.paid && x.day === day).forEach(x => {
      expected += x.amount; best += x.amount; worst += x.amount; label = `+${x.title}`
    })
    dueOutflows(state, day).filter(x => x.day === day).forEach(x => {
      expected -= x.amount; best -= x.amount; worst -= x.amount; label = `−${x.title}`
    })
    unresolvedShock.filter(x => x.day === day).forEach(x => {
      expected -= x.amount * 0.45; worst -= x.amount; label = `⚡ ${x.title}`
    })
    points.push({ day, expected: round(expected), best: round(best), worst: round(worst), event: label })
  }
  return points
}

export const calculateMetrics = (state: FinanceState): Metrics => {
  const balance = getBalance(state)
  const daysRemaining = Math.max(1, 31 - state.day)
  const expectedIncome = state.incomes.filter(x => !x.paid && x.day >= state.day).reduce((s, x) => s + x.amount, 0)
  const committedRemaining = getCommittedRemaining(state)
  const safePool = balance + expectedIncome - committedRemaining - state.emergencyBuffer
  const safeAllowance = Math.max(0, safePool / daysRemaining)
  const burnRate = getBurnRate(state)
  const runway = burnRate > 0 ? balance / burnRate : daysRemaining
  const forecast = buildForecast(state)
  const endBalance = forecast.at(-1)?.expected ?? balance
  const projectedNegativeDays = forecast.filter(p => p.expected < 0).length
  const runwayPressure = clamp((daysRemaining - runway) / daysRemaining * 100)
  const deficitPressure = clamp(projectedNegativeDays / daysRemaining * 100)
  const bufferCoverage = clamp(100 - state.emergencyBuffer / Math.max(1, balance) * 100)
  const committedShare = clamp(committedRemaining / Math.max(1, balance + expectedIncome) * 100)
  const shockExposure = clamp(state.events.filter(e => !e.handled && e.day >= state.day).reduce((s, e) => s + e.amount, 0) / Math.max(1, balance) * 100)
  const riskScore = round(runwayPressure * .35 + deficitPressure * .25 + bufferCoverage * .2 + committedShare * .1 + shockExposure * .1)
  const riskLevel = riskScore < 25 ? 'Low' : riskScore < 50 ? 'Moderate' : riskScore < 75 ? 'High' : 'Critical'

  const expenses = state.transactions.filter(t => t.kind === 'expense')
  const spent = expenses.reduce((s, t) => s + t.amount, 0)
  const budgetAdherence = clamp(100 - Math.max(0, spent / state.budget - state.day / 30) * 120)
  const savingsProgress = state.goals.length ? state.goals.reduce((s, g) => s + g.saved / g.target * 100, 0) / state.goals.length : 100
  const bufferScore = clamp(state.emergencyBuffer / 1200 * 100)
  const activeSubs = state.subscriptions.filter(s => s.active)
  const subEfficiency = activeSubs.length ? activeSubs.reduce((s, x) => s + x.worthIt / 5 * 100, 0) / activeSubs.length : 100
  const discretionary = expenses.filter(t => ['Food', 'Shopping', 'Other'].includes(t.category)).reduce((s, t) => s + t.amount, 0)
  const spendMix = clamp(100 - discretionary / Math.max(1, spent) * 75)
  const consistency = clamp(68 + state.noSpendStreak * 5)
  const healthBreakdown = {
    'Budget control': round(budgetAdherence),
    'Savings pace': round(savingsProgress),
    'Emergency buffer': round(bufferScore),
    'Subscription value': round(subEfficiency),
    'Spend quality': round(spendMix),
    'Consistency': round(consistency),
  }
  const healthScore = round(budgetAdherence * .25 + savingsProgress * .2 + bufferScore * .15 + subEfficiency * .15 + spendMix * .15 + consistency * .1)
  const riskDrivers = [
    committedShare > 35 ? `${round(committedShare)}% of available cash is already spoken for` : 'Upcoming commitments remain covered',
    runway < daysRemaining ? `Current burn gives only ${round(runway)} days of runway` : 'Runway covers the rest of the month',
    shockExposure > 15 ? 'Two unresolved surprise costs could hit this cycle' : 'Shock exposure is currently contained',
  ]

  return { balance: round(balance), daysRemaining, expectedIncome, committedRemaining: round(committedRemaining), safeAllowance: round(safeAllowance), safePool: round(safePool), burnRate: round(burnRate), runway: Math.max(0, Number(runway.toFixed(1))), endBalance: round(endBalance), riskScore, riskLevel, riskDrivers, healthScore, healthBreakdown, forecast }
}

export const applyDecision = (source: FinanceState, decision: Decision): FinanceState => {
  const state = structuredClone(source)
  const tx = (kind: 'expense' | 'income', title: string, amount: number, category: Transaction['category']): Transaction => ({ id: crypto.randomUUID(), day: state.day, title: safeText(title), amount: safeAmount(amount), kind, category })
  if (decision.type === 'expense') state.transactions.unshift(tx('expense', decision.title, decision.amount, decision.category))
  if (decision.type === 'income') state.transactions.unshift(tx('income', decision.title, decision.amount, 'Income'))
  if (decision.type === 'cancel-subscription') {
    const item = state.subscriptions.find(s => s.id === decision.subscriptionId)
    if (item) item.active = false
  }
  if (decision.type === 'add-subscription') state.subscriptions.push({ id: crypto.randomUUID(), title: safeText(decision.title), amount: safeAmount(decision.amount), day: Math.min(30, state.day + 5), active: true, paid: false, worthIt: 3 })
  if (decision.type === 'goal-contribution') {
    const goal = state.goals.find(g => g.id === decision.goalId)
    if (goal) goal.saved = Math.min(goal.target, goal.saved + decision.amount)
    state.transactions.unshift(tx('expense', `Moved to ${goal?.title ?? 'goal'}`, decision.amount, 'Other'))
  }
  if (decision.type === 'handle-event') {
    const event = state.events.find(e => e.id === decision.eventId)
    if (event && !event.handled) {
      event.handled = true
      if (decision.strategy === 'goal') {
        const goal = state.goals[0]
        const used = Math.min(goal.saved, event.amount)
        goal.saved -= used
        if (event.amount > used) state.transactions.unshift(tx('expense', event.title, event.amount - used, 'Other'))
      } else {
        state.transactions.unshift(tx('expense', event.title, event.amount, decision.strategy === 'buffer' ? 'Bills' : 'Other'))
        if (decision.strategy === 'buffer') state.emergencyBuffer = Math.max(0, state.emergencyBuffer - event.amount)
      }
    }
  }
  return state
}

export const simulate = (state: FinanceState, decision: Decision): SimulationResult => {
  const before = calculateMetrics(state)
  const nextState = applyDecision(state, decision)
  const after = calculateMetrics(nextState)
  return {
    before, after, nextState,
    delta: {
      balance: after.balance - before.balance,
      allowance: after.safeAllowance - before.safeAllowance,
      endBalance: after.endBalance - before.endBalance,
      risk: after.riskScore - before.riskScore,
      health: after.healthScore - before.healthScore,
    },
  }
}

export const advanceOneDay = (source: FinanceState): FinanceState => {
  if (source.day >= 30) return source
  const state = structuredClone(source)
  state.day += 1
  const add = (kind: 'expense' | 'income', title: string, amount: number, category: Transaction['category']) => state.transactions.unshift({ id: crypto.randomUUID(), day: state.day, title, amount, kind, category })
  state.incomes.filter(x => !x.paid && x.day === state.day).forEach(x => { x.paid = true; add('income', x.title, x.amount, 'Income') })
  state.commitments.filter(x => !x.paid && x.day === state.day).forEach(x => { x.paid = true; add('expense', x.title, x.amount, 'Bills') })
  state.subscriptions.filter(x => x.active && !x.paid && x.day === state.day).forEach(x => { x.paid = true; add('expense', x.title, x.amount, 'Subscriptions') })
  const spentToday = state.transactions.some(t => t.day === state.day && t.kind === 'expense')
  state.noSpendStreak = spentToday ? 0 : state.noSpendStreak + 1
  return state
}
