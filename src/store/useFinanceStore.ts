import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { advanceOneDay, applyDecision, calculateMetrics } from '../engine/engine'
import { createSeedState } from '../engine/seed'
import type { Decision, FinanceState, Metrics } from '../engine/types'

interface UndoState { state: FinanceState; message: string }

interface FinanceStore {
  finance: FinanceState
  undoState: UndoState | null
  toast: string | null
  metrics: () => Metrics
  commit: (decision: Decision, message?: string) => void
  nextDay: () => void
  jumpToDay: (day: number) => void
  reset: () => void
  undo: () => void
  clearToast: () => void
}

export const useFinanceStore = create<FinanceStore>()(persist((set, get) => ({
  finance: createSeedState(),
  undoState: null,
  toast: null,
  metrics: () => calculateMetrics(get().finance),
  commit: (decision, message = 'Decision committed — every metric has recalculated.') => set(s => ({
    undoState: { state: structuredClone(s.finance), message },
    finance: applyDecision(s.finance, decision),
    toast: message,
  })),
  nextDay: () => set(s => ({
    undoState: { state: structuredClone(s.finance), message: 'Day advanced' },
    finance: advanceOneDay(s.finance),
    toast: s.finance.day >= 30 ? 'You made it to Day 30.' : `Day ${s.finance.day + 1} — scheduled cashflow synced.`,
  })),
  jumpToDay: (target) => set(s => {
    let next = s.finance
    while (next.day < target) next = advanceOneDay(next)
    return { undoState: { state: structuredClone(s.finance), message: 'Time travel' }, finance: next, toast: `Jumped to Day ${next.day}.` }
  }),
  reset: () => set({ finance: createSeedState(), undoState: null, toast: 'Demo reset to Day 8.' }),
  undo: () => set(s => s.undoState ? ({ finance: s.undoState.state, undoState: null, toast: 'Last change undone.' }) : s),
  clearToast: () => set({ toast: null }),
}), { name: 'rupeepulse-v1', partialize: s => ({ finance: s.finance }) }))
