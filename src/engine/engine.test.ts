import { describe, expect, it } from 'vitest'
import { advanceOneDay, applyDecision, buildForecast, calculateMetrics, getBalance, simulate } from './engine'
import { createSeedState } from './seed'

describe('RupeePulse finance engine', () => {
  it('keeps the demo seed internally consistent', () => {
    const state = createSeedState()
    const metrics = calculateMetrics(state)
    expect(getBalance(state)).toBe(6420)
    expect(metrics.safeAllowance).toBeGreaterThan(0)
    expect(metrics.safeAllowance).toBeLessThan(metrics.balance / metrics.daysRemaining)
  })

  it('projects best, expected and worst forecast bands through day 30', () => {
    const forecast = buildForecast(createSeedState())
    expect(forecast[0].day).toBe(8)
    expect(forecast.at(-1)?.day).toBe(30)
    expect(forecast.at(-1)!.best).toBeGreaterThan(forecast.at(-1)!.expected)
    expect(forecast.at(-1)!.expected).toBeGreaterThan(forecast.at(-1)!.worst)
  })

  it('propagates one ₹500 expense through all core metrics', () => {
    const state = createSeedState()
    const result = simulate(state, { type: 'expense', title: 'Test expense', amount: 500, category: 'Other' })
    expect(result.delta.balance).toBe(-500)
    expect(result.delta.allowance).toBeLessThan(0)
    expect(result.delta.endBalance).toBeLessThan(0)
    expect(result.after.riskScore).toBeGreaterThanOrEqual(result.before.riskScore)
    expect(result.after.healthScore).toBeLessThan(result.before.healthScore)
    expect(getBalance(state)).toBe(6420)
  })

  it('subscription cancellation does not mutate the original state', () => {
    const state = createSeedState()
    const result = simulate(state, { type: 'cancel-subscription', subscriptionId: 's3' })
    expect(state.subscriptions.find(x => x.id === 's3')?.active).toBe(true)
    expect(result.nextState.subscriptions.find(x => x.id === 's3')?.active).toBe(false)
    expect(result.after.safeAllowance).toBeGreaterThan(result.before.safeAllowance)
  })

  it('propagates income into balance, allowance, forecast and health', () => {
    const result = simulate(createSeedState(), { type: 'income', title: 'Freelance payout', amount: 2500 })
    expect(result.delta.balance).toBe(2500)
    expect(result.delta.allowance).toBeGreaterThan(0)
    expect(result.delta.endBalance).toBeGreaterThan(0)
    expect(result.after.healthScore).toBeGreaterThanOrEqual(result.before.healthScore)
  })

  it('sanitises titles and caps hostile or accidental amounts', () => {
    const next = applyDecision(createSeedState(), { type: 'expense', title: ' <script>alert(1)</script> ', amount: Number.POSITIVE_INFINITY, category: 'Other' })
    expect(next.transactions[0].title).not.toContain('<')
    expect(next.transactions[0].title).not.toContain('>')
    expect(next.transactions[0].amount).toBe(0)
  })

  it('caps goal contributions at the target without mutating the source goal', () => {
    const state = createSeedState()
    const next = applyDecision(state, { type: 'goal-contribution', goalId: 'g1', amount: 10000 })
    expect(next.goals[0].saved).toBe(next.goals[0].target)
    expect(state.goals[0].saved).toBe(1500)
  })

  it('handles a surprise cost once and consumes the selected buffer', () => {
    const state = createSeedState()
    const next = applyDecision(state, { type: 'handle-event', eventId: 'e1', strategy: 'buffer' })
    const repeated = applyDecision(next, { type: 'handle-event', eventId: 'e1', strategy: 'buffer' })
    expect(next.events[0].handled).toBe(true)
    expect(next.emergencyBuffer).toBe(0)
    expect(repeated.transactions).toHaveLength(next.transactions.length)
  })

  it('settles scheduled cashflow exactly on its due day', () => {
    const state = createSeedState()
    state.day = 9
    const next = advanceOneDay(state)
    expect(next.day).toBe(10)
    expect(next.subscriptions.find(item => item.id === 's1')?.paid).toBe(true)
    expect(next.transactions[0]).toMatchObject({ title: 'Spotify Student', amount: 119, kind: 'expense' })
    expect(state.subscriptions.find(item => item.id === 's1')?.paid).toBe(false)
  })

  it('increments a no-spend streak on a day without scheduled expenses', () => {
    const state = createSeedState()
    state.day = 10
    const next = advanceOneDay(state)
    expect(next.day).toBe(11)
    expect(next.noSpendStreak).toBe(state.noSpendStreak + 1)
  })

  it('stops deterministic time at Day 30', () => {
    const state = createSeedState()
    state.day = 30
    expect(advanceOneDay(state)).toBe(state)
    expect(calculateMetrics(state).daysRemaining).toBe(1)
    expect(buildForecast(state)).toHaveLength(1)
  })
})
