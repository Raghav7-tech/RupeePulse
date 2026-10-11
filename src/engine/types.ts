export type Category = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Subscriptions' | 'Health' | 'Income' | 'Other'

export interface Transaction {
  id: string
  day: number
  title: string
  amount: number
  kind: 'expense' | 'income'
  category: Category
}

export interface ScheduledItem {
  id: string
  title: string
  amount: number
  day: number
  paid: boolean
}

export type Income = ScheduledItem
export interface Commitment extends ScheduledItem { essential: boolean }
export interface Subscription extends ScheduledItem { active: boolean; worthIt: number; icon?: string }

export interface SavingsGoal {
  id: string
  title: string
  target: number
  saved: number
  deadlineDay: number
  priority: 'High' | 'Medium' | 'Low'
  emoji: string
}

export interface UnexpectedEvent {
  id: string
  day: number
  title: string
  amount: number
  description: string
  handled: boolean
}

export interface FinanceState {
  day: number
  budget: number
  emergencyBuffer: number
  transactions: Transaction[]
  incomes: Income[]
  commitments: Commitment[]
  subscriptions: Subscription[]
  goals: SavingsGoal[]
  events: UnexpectedEvent[]
  noSpendStreak: number
}

export type Decision =
  | { type: 'expense'; title: string; amount: number; category: Category }
  | { type: 'income'; title: string; amount: number }
  | { type: 'cancel-subscription'; subscriptionId: string }
  | { type: 'add-subscription'; title: string; amount: number }
  | { type: 'goal-contribution'; goalId: string; amount: number }
  | { type: 'handle-event'; eventId: string; strategy: 'buffer' | 'goal' | 'spend' }

export interface ForecastPoint {
  day: number
  expected: number
  best: number
  worst: number
  event?: string
}

export interface Metrics {
  balance: number
  daysRemaining: number
  expectedIncome: number
  committedRemaining: number
  safeAllowance: number
  safePool: number
  burnRate: number
  runway: number
  endBalance: number
  riskScore: number
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  riskDrivers: string[]
  healthScore: number
  healthBreakdown: Record<string, number>
  forecast: ForecastPoint[]
}

export interface SimulationResult {
  before: Metrics
  after: Metrics
  delta: {
    balance: number
    allowance: number
    endBalance: number
    risk: number
    health: number
  }
  nextState: FinanceState
}
