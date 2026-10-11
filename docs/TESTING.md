# Testing and verification

## Automated coverage

The engine suite covers seed integrity, ordered forecast bands, multi-metric propagation, immutability, income, subscription cancellation, goal caps, event handling, sanitisation, scheduled cashflow, no-spend streaks, and Day 30 boundaries.

Run the complete gate:

```bash
npm ci
npm run check
npm audit --audit-level=high
```

## Responsive test matrix

| Viewport | Primary risk checked |
| --- | --- |
| 360 × 800 | Single-column cards, orbit containment, bottom navigation, no horizontal overflow |
| 480 × 900 | Forms, event choices, subscription controls and tap targets |
| 768 × 1024 | Tablet grids, navigation menu, chart labels and footer |
| 1024 × 768 | Compact desktop dashboard and simulator columns |
| 1280 × 800 | Standard laptop layout and above-the-fold information hierarchy |
| 1920 × 1080 | Maximum-width containment and readable line lengths |

## Keyboard flow

1. Tab to **Skip to main content** and activate it.
2. Traverse primary navigation, day controls, forms, simulations, and actions in visual order.
3. Confirm focus moves to the main heading region after page changes.
4. Trigger validation with empty Quick Add fields and verify the alert is announced.
5. Enable reduced motion and verify auto animations collapse.

## Critical scenario

A ₹500 expense must lower remaining balance, safe daily allowance, month-end forecast, and health while leaving the source simulation state unchanged. This is asserted in the automated suite because it proves the product is an interconnected decision system rather than a set of independent counters.
