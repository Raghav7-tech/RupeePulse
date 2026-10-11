import type { FinanceState } from './types'

export const createSeedState = (): FinanceState => ({
  day: 8,
  budget: 10000,
  emergencyBuffer: 700,
  noSpendStreak: 2,
  transactions: [
    { id: 't1', day: 8, title: 'Swiggy meal bowl', amount: 280, kind: 'expense', category: 'Food' },
    { id: 't2', day: 7, title: 'Delhi Metro smart card', amount: 400, kind: 'expense', category: 'Transport' },
    { id: 't3', day: 6, title: 'Blue Tokai cold brew', amount: 220, kind: 'expense', category: 'Food' },
    { id: 't4', day: 5, title: 'Spotify Student', amount: 119, kind: 'expense', category: 'Subscriptions' },
    { id: 't5', day: 4, title: 'Blinkit grocery restock', amount: 640, kind: 'expense', category: 'Food' },
    { id: 't6', day: 2, title: 'Hostel + utilities share', amount: 2321, kind: 'expense', category: 'Bills' },
    { id: 't7', day: 3, title: 'Logo design advance', amount: 400, kind: 'income', category: 'Income' },
  ],
  incomes: [
    { id: 'i1', title: 'Design gig payout', amount: 1500, day: 15, paid: false },
    { id: 'i2', title: 'Travel reimbursement', amount: 600, day: 24, paid: false },
  ],
  commitments: [
    { id: 'c1', title: 'Electricity share', amount: 450, day: 12, paid: false, essential: true },
    { id: 'c2', title: 'Jio recharge', amount: 719, day: 14, paid: false, essential: true },
    { id: 'c3', title: 'Exam lab fee', amount: 600, day: 25, paid: false, essential: true },
  ],
  subscriptions: [
    { id: 's1', title: 'Spotify Student', amount: 119, day: 10, paid: false, active: true, worthIt: 5, icon: 'music' },
    { id: 's2', title: 'Netflix Mobile', amount: 199, day: 12, paid: false, active: true, worthIt: 2, icon: 'tv' },
    { id: 's3', title: 'Cult.fit Membership', amount: 1099, day: 16, paid: false, active: true, worthIt: 3, icon: 'dumbbell' },
    { id: 's4', title: 'iCloud 50 GB', amount: 75, day: 24, paid: false, active: true, worthIt: 5, icon: 'cloud' },
  ],
  goals: [
    { id: 'g1', title: 'Goa weekend', target: 4000, saved: 1500, deadlineDay: 30, priority: 'High', emoji: '🏝️' },
    { id: 'g2', title: 'Emergency cushion', target: 2000, saved: 700, deadlineDay: 30, priority: 'Medium', emoji: '🛟' },
  ],
  events: [
    { id: 'e1', day: 8, title: 'Laptop charger gave up', amount: 850, description: 'A replacement is needed before tomorrow’s class.', handled: false },
    { id: 'e2', day: 18, title: "Friend's birthday plan", amount: 600, description: 'The group picked a pricier place than expected.', handled: false },
    { id: 'e3', day: 22, title: 'Pharmacy run', amount: 420, description: 'A small but unavoidable health expense.', handled: false },
  ],
})
