# AI Pulse
Public two-column time-series dashboard. Collected 2026-11-12. No scheduled refresh enabled.

26 cards, including one explicit unavailable-data card. The HTML contains static SVG fallbacks and embedded data; a local Plotly bundle progressively enables interaction. No runtime third-party fetch is needed to render.

## Data coverage and definitions
- npm: complete daily download history since package creation, rolling seven-day totals. Download counts are not users.
- PyPI Stats: all returned retention data, without mirrors; earlier history unavailable in this API.
- Ramp/FRED: monthly adoption from Jan 2023. Ramp employee spend from Jul 2023. Token volume/spend indexed, prices blended USD per million tokens, from Jan 2025. Cite Ramp Economics Lab and FRED.
- VS Code: VSX Atlas independent observation history, marketplace only, from Oct 26 2026; not a complete Microsoft historical series.
- OpenRouter: available weekly programming collection top-model shares from Nov 2025. Top eight models ranked by maximum observed share. Missing top-cohort observations are null, not zero. Not total-market share.
- Business metrics: only primary-company disclosures, plotted as points; approximate or lower-bound observations labelled. Month anchors use the first day solely for placement. ARR/run-rate is not realized annual revenue. Current last observation is not a claim of current value.
- GitHub open issues: collected snapshots only; historical reopen/delete states cannot be reconstructed.
- GitClear: raw historical data unavailable; original 25% claim not validated and not plotted.

`data/charts.json` contains series and provenance; the same payload is embedded in HTML. Per-chart CSV exports include units and point-specific links. Controls: date presets, range slider, drag zoom, legend toggles, log/linear, full-screen card and CSV.

## Build
Working collector/build source lives in the owner's local `artifacts/ai-pulse/` workspace (`collect_long.py`, `build_long.py`, `research/`). Public repo intentionally contains only sanitized numeric datasets and rendered assets, not browser captures. Re-run collection and the builder before committing a refreshed snapshot. No browser-refresh control falsely implies fresh upstream data.

Plotly.js 3.1.0 is vendored under the MIT license; see vendor/LICENSE.plotly.

## 2026-11-13 top section
Ramp volume and spend lead the grid. OpenRouter Rankings Top Models follows full-width, distinct from the programming collection share chart below. Public chart data covers 53 weekly buckets (2025-11-10–2026-11-09), data through 2026-11-12. Stack reproduces each period's top nine models + Others; absent model cells are null, not asserted zero usage. Source forecast series is excluded; latest bucket is incomplete. Values divided by 1e12 for T tokens. Source: OpenRouter (https://openrouter.ai/rankings), retrieved 2026-11-13. Licensed under CC BY 4.0. All weekly stack totals checked against source. No API credentials or private traffic used.
