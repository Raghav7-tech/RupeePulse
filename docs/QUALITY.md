# Quality, security, performance, and accessibility

## Release gate

`npm run check` runs TypeScript production compilation, zero-warning ESLint, deterministic unit tests, and the Vite production build. The dependency audit reports zero known vulnerabilities.

## Security model

- No backend, authentication token, analytics script, remote font, or third-party data request.
- React text rendering prevents HTML execution; no `dangerouslySetInnerHTML` is used.
- Titles are trimmed, stripped of angle brackets, and length limited.
- Amounts must be finite, positive where required, and are capped at ₹10,000,000.
- The Content Security Policy blocks objects, form exfiltration, foreign scripts, and base-tag rewriting.
- `localStorage` contains demo financial state only.

## Performance budget

| Asset | Budget | Enforcement |
| --- | ---: | --- |
| Initial JavaScript gzip | < 100 KB | Inspect Vite build output |
| Lazy feature chunk gzip | < 10 KB each | Inspect Vite build output |
| External requests | 0 | CSP and source review |
| Unexpected layout shift | 0 target | Explicit chart, hero, card, and loading dimensions |

Optimisations include route-level splitting, CSS motion, native SVG charts, system fonts, no raster assets, deferred below-fold rendering, stable component dimensions, and reduced-motion support.

## Accessibility contract

- Semantic `header`, `nav`, `main`, `section`, `article`, `aside`, and `footer` landmarks.
- Skip link and programmatic main-content focus after navigation.
- Complete keyboard operation with visible `:focus-visible` treatment.
- `aria-current`, `aria-expanded`, `aria-pressed`, live status, inline error alerts, and labelled controls.
- SVG charts include title/description plus an exact text summary.
- Progress indicators expose names, minimum, maximum, and current values.
- Touch targets are at least 44 px at tablet and mobile widths.
- Motion collapses under `prefers-reduced-motion`.

## Privacy

The product makes no network request after static assets load. All decisions, calculations, and saved demo state remain in the browser and can be removed with Reset or browser storage controls.
