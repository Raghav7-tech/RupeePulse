# RupeePulse

RupeePulse is a responsive, frontend-only personal-finance simulator built for the PROMPT RUN “₹10,000 for 30 days” challenge. It helps a Gen Z user see how a decision changes not only their balance, but their daily flexibility, savings goal, runway, risk, financial health, and month-end forecast.

## Run locally

```bash
npm install
npm run dev
```

Production and test checks:

```bash
npm test
npm run build
```

## Stack

- React + TypeScript + Vite
- Zustand with `localStorage` persistence
- Recharts for forecast bands
- Framer Motion for meaningful state transitions
- Lucide React icons
- Tailwind build pipeline plus an original responsive design system

## Product architecture

- `src/engine/` contains the pure financial model, deterministic seed data, and unit tests.
- `src/store/` is the single state boundary. All confirmed decisions, day advancement, reset, and undo flow through it.
- `src/App.tsx` contains the four user-facing workspaces: Today, Decision Lab, Forecast, and Plans & Goals.
- `src/styles.css` contains the Obsidian Kinetic visual system and responsive rules for desktop, tablet, and mobile.

## Core formulas

- **Safe daily allowance:** `(balance + expected income − remaining commitments − priority goal reserve − emergency buffer) / days remaining`, clamped to zero.
- **Forecast:** recent discretionary burn plus scheduled income, bills, subscriptions, and probability-weighted shocks. Best and worst bands vary burn and shock exposure.
- **Risk:** weighted runway pressure, projected deficit days, buffer coverage, committed share, and unresolved shock exposure.
- **Health:** weighted budget control, savings pace, emergency buffer, subscription value, spending quality, and consistency.

`simulate(state, decision)` clones state, applies the hypothetical choice, and recomputes the same metrics used everywhere else. The original state remains untouched until the user confirms.

## Demo flow

1. Review the Day 8 dashboard.
2. Open **Decision Lab** and compare a preset or custom choice.
3. Inspect the six-part ripple chain, verdict, and cheaper alternative.
4. Confirm or discard.
5. Use **Next day** or **Auto** to trigger scheduled cashflow.
6. Audit subscriptions under **Plans & Goals** and inspect forecast uncertainty under **Forecast**.

All data stays in the browser. Use Reset in the header menu to restore the seeded scenario.
