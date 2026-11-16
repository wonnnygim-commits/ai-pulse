# AI Pulse — reusable public data

[Dashboard](https://wonnnygim-commits.github.io/ai-pulse/) · [Download catalog](https://wonnnygim-commits.github.io/ai-pulse/downloads/)

This public GitHub repository is the cloud copy of AI Pulse's accumulated dataset. The dashboard is a consumer, not the only storage format. Only public-source AI Pulse data belongs here; do not upload private research, attachments, credentials or personal files.

## Download / analysis

- `data/exports/observations.csv`: UTF-8 BOM, Excel-friendly, one series/date per row.
- `data/exports/observations.json`: same observations with archive metadata.
- `data/exports/ai-pulse.sqlite`: `observations`, `datasets`, `metadata` tables; usable offline.
- `data/exports/datasets/c*.csv` / `.json`: one dataset per file.
- `data/exports/ai-pulse-data.zip`: current normalized dataset, metadata and SQLite (not the whole raw archive).
- `data/exports/catalog.json`, `schema.json`, `manifest.json`: definitions, stable IDs, SHA-256 integrity hashes.
- `data/exports/refresh-status.json`: attempted collection time, source errors and reviews still required. Export version time is NOT a universal source freshness timestamp.

Stable download URL example:
`https://wonnnygim-commits.github.io/ai-pulse/data/exports/observations.csv`

```python
import pandas as pd
url = 'https://wonnnygim-commits.github.io/ai-pulse/data/exports/observations.csv'
df = pd.read_csv(url, parse_dates=['date'])
ramp = df[df.dataset_id == 'c1'].pivot(index='date', columns='series', values='value')
```

```sql
SELECT date, series, value, unit FROM observations
WHERE dataset_id = 'c1' ORDER BY date, series;
```

## Layers and history

1. `data/archive/source-snapshots/`: content-addressed source datasets, retained without overwriting earlier payloads.
2. `data/archive/snapshots/`: collected chart vintages.
3. `data/archive/events/`: historical corrections and blocked/rebased-index merges.
4. `data/archive/history.json`: accumulated current canonical series; upstream rolling-window expiry does not erase our old dates.
5. `data/exports/`: portable analysis products from that history.
6. `data/charts.json` + `index.html`: dashboard presentation.

Repository commits version every published release. For a fixed research input, use the relevant commit SHA in `https://raw.githubusercontent.com/wonnnygim-commits/ai-pulse/<COMMIT>/data/exports/observations.csv`, rather than the changing `main` URL. For all raw vintages, clone this repository. ZIP is the current analysis bundle only.

Missing values are not zero. Some metrics are normalized indices, seven-day sums, weekly aggregates, or occasional company disclosures; see dataset notes and point labels. No interpolation is performed. Source rights continue to apply, including OpenRouter CC BY 4.0 attribution. A public export does not grant rights beyond those of the underlying sources.

## Refresh and recovery

Daily 09:00 Asia/Seoul source checking is scheduled in OpenClaw on the owner's Mac; it collects and publishes to GitHub. **Collection requires the Mac/OpenClaw to be running. Downloads remain available independently through GitHub Pages.** This is cloud storage, not yet cloud-hosted collection compute.

Source failures preserve last valid values and are recorded; monthly/weekly/disclosure series add data only when their source actually publishes a new observation. Raw source payloads, normalized history, and exports are different layers. The public chart export includes derived values; consult raw snapshots when recalculating.

Rebuild portable products with standard-library Python:
`python3 scripts/export_data.py`

For a substantially larger archive, the same schemas can migrate to object storage without changing stable dataset/series identities. SQLite and CSV avoid locking analysis to the dashboard implementation.
