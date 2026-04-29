# Graphic Wizard And Live Data Design

## Goal

Upgrade the local Pokemon Champions companion from a functional V1 dashboard into a French, more visual assistant that guides setup and can attempt to load fresh Smogon usage data.

## Scope

- French-first visible copy for the app and README.
- A three-step setup wizard: choose format, paste a Showdown team, then review the generated analysis.
- A richer dashboard layout with clearer status, severity, team, audit, and threat cards.
- Inline help panels that explain how to read weaknesses, meta threat scores, and data freshness.
- A Smogon chaos JSON refresh flow for the latest verified usage month, with an explicit local-demo fallback when fetch, CORS, or parsing fails.
- Repository hygiene: stronger ignores, editor defaults, useful `check` script, and cleaner dependency placement.

## Data Source Decision

As of 2026-04-29, Smogon's public `/stats/` index lists `2026-03` as the newest available month. The V1 live refresh will target JSON files under:

- `https://www.smogon.com/stats/2026-03/chaos/gen9vgc2026regf-1760.json`
- `https://www.smogon.com/stats/2026-03/chaos/gen9bssregi-1760.json`
- `https://www.smogon.com/stats/2026-03/chaos/gen9nationaldex-1760.json`

The app will parse only the top usage rows needed for the local threat engine. It will not try to mirror the full Smogon dataset locally.

## UX

The first screen remains the actual tool, not a landing page. The setup wizard sits at the top and uses compact steps, while the analysis dashboard stays immediately accessible below. Help text is contextual and concise, so users get guidance without leaving the workflow.

## Error Handling

Live data refresh returns a French status message. Success states show the imported month and source. Failure states keep the bundled demo snapshots and clearly say why live data was not applied.

## Testing

Tests should cover wizard rendering, French labels, help content, successful Smogon parsing, non-OK fetch failures, invalid payloads, and the local fallback path.
