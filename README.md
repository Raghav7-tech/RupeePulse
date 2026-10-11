# RupeePulse

RupeePulse is a responsive, frontend-only personal-finance simulator built for the PROMPT RUN “₹10,000 for 30 days” challenge. It helps a Gen Z user see how a decision changes not only their balance, but their daily flexibility, savings goal, runway, risk, financial health, and month-end forecast.

[Live on Vercel](https://rupee-pulse-chi.vercel.app/) · [GitHub Pages mirror](https://raghav7-tech.github.io/RupeePulse/) · [Product plan](./DESIGN.md)

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

Run the complete release gate with one command:

```bash
npm run check
```

## Stack

- React + TypeScript + Vite
- Zustand with `localStorage` persistence
- Recharts for forecast bands
- Framer Motion for meaningful state transitions
- Lucide React icons
- Tailwind build pipeline plus an original responsive design system

## Feature coverage

| Product area | What is implemented |
| --- | --- |
| Today | Live balance, safe daily allowance, health, risk, runway, goal, forecast, subscriptions and quick-add ledger |
| Decision Lab | Presets and custom income/expense decisions, six-metric before/after comparison, ripple chain, plain-language verdict, cheaper alternative, confirm/discard |
| Forecast | Best/expected/worst bands, scheduled cashflow, shock exposure, risk drivers and six-part health breakdown |
| Plans & Goals | Subscription value audit, one-click cancellation simulation, annualised drain, multiple goals and contributions |
| Time | Next-day and auto-play controls apply income, bills, subscriptions and events deterministically |
| Resilience | Undo, reset, validation, local persistence, loading skeletons, reduced-motion support and no horizontal overflow at 360px |

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

## Quality, security, and accessibility

- TypeScript strict mode and a zero-warning ESLint gate.
- Four deterministic engine tests, including the required ₹500 interconnection test.
- Zero known npm vulnerabilities at release (`npm audit`).
- User-entered amounts are finite, positive, capped, and normalised; text is trimmed, bounded, and stripped of markup delimiters. React renders all content as escaped text.
- A restrictive Content Security Policy blocks third-party scripts, objects, framing bases, and form exfiltration.
- The forecast chart is lazy-loaded into its own chunk; there are no remote API or web-font requests on first paint.
- Semantic landmarks, visible focus, skip navigation, labelled fields, `aria-current`, live result announcements, keyboard operation, and reduced-motion support.
- Responsive QA targets: 360px, 768px, 1280px, and 1920px.

## Continuous deployment

Every push to `main` runs lint, tests, and a GitHub-Pages-mode production build in GitHub Actions. The default Vite build keeps root-relative assets for Vercel; the Pages build uses the repository subpath. This prevents one hosting target from breaking the other.

## Demo flow

1. Review the Day 8 dashboard.
2. Open **Decision Lab** and compare a preset or custom choice.
3. Inspect the six-part ripple chain, verdict, and cheaper alternative.
4. Confirm or discard.
5. Use **Next day** or **Auto** to trigger scheduled cashflow.
6. Audit subscriptions under **Plans & Goals** and inspect forecast uncertainty under **Forecast**.

All data stays in the browser. Use Reset in the header menu to restore the seeded scenario.
