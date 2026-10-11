import { describe, expect, it } from 'vitest'
import { buildForecast, calculateMetrics, getBalance, simulate } from './engine'
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
})
