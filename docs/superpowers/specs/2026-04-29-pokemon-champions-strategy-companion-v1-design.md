# Pokemon Champions Strategy Companion V1 Design

Date: 2026-04-29

## Goal

Build a pragmatic local web app for Pokemon Champions competitive team analysis. The first version focuses on reliable team audit and meta threat detection, not automatic team rebuilding or match plans.

The app should let the user import a Pokemon Showdown paste, choose a Champions format, edit the team manually, and immediately see:

- defensive and offensive coverage issues;
- missing or overloaded team roles;
- speed tier concerns;
- popular meta threats that the team handles poorly;
- clear explanations for every warning.

The product vision can later expand to set suggestions, replacements, plans of match, historical meta tracking, and desktop packaging. V1 should stay small enough to ship and iterate.

## Scope

V1 includes:

- local React/Vite web app;
- format selector for `Champions VGC`, `Champions BSS`, and `Champions OU`;
- Pokemon Showdown paste import;
- manual editing of parsed sets;
- local data snapshot with source/date/version metadata;
- snapshot update flow from configured public sources when available;
- team audit engine;
- meta threat ranking from usage snapshots;
- UI states for missing, stale, demo, and complete data;
- focused unit tests for parsing, type calculations, threat scoring, and format isolation.

V1 excludes:

- automatic Pokemon replacement suggestions;
- full set optimization;
- matchup-specific lead planning;
- AI-generated strategy advice;
- user accounts, cloud sync, hosting, or desktop packaging.

## Product Shape

The main screen is a dense utility dashboard:

- top bar: format selector, snapshot status, and update button;
- left column: Showdown paste input, parsed six-Pokemon preview, and manual set editing;
- center column: team audit cards and detailed coverage sections;
- right column: ranked meta threats with simple filters.

The analysis recalculates when the team or selected format changes. Diagnostics are explainable: each warning lists the Pokemon, moves, types, or usage data that triggered it.

## Data Strategy

The app uses two data families.

Reference data:

- Pokemon names, forms, typings, base stats;
- moves and their type/category/power when available;
- abilities and items;
- type chart;
- format metadata and validation hints where available.

Meta data:

- usage rankings by supported format;
- optional spread, move, item, ability, and teammate usage when available;
- snapshot metadata: format, date, source URL, version, battle count if provided, and import timestamp.

The app should work offline with the latest local snapshot. The update button starts a refresh through configured data-source adapters. If a source is unavailable, blocked, or not yet configured for a format, the app keeps the current snapshot and shows an explicit refresh error instead of silently falling back.

If Champions-specific data is incomplete, the app may load a demo or fallback snapshot, but the UI must label it clearly and avoid presenting those results as authoritative.

Relevant public sources verified during design:

- The official Pokemon Champions site says Pokemon Champions is available on Nintendo Switch and Nintendo Switch 2 and is coming to mobile in 2026.
- The Smogon Champions forum has dedicated Champions BSS and Champions VGC sections and Champions OU discussion/resources.
- Pokemon Showdown exposes reference data files such as `pokedex.json`, `moves.json`, `items.js`, `abilities.js`, `formats.js`, and `typechart.js`.
- The `pkmn` Smogon data docs describe format identifiers and recommend relying on Showdown format data for current formats.

## Architecture

The app is client-side first.

Core modules:

- `team-import`: parses Pokemon Showdown text into structured sets.
- `team-editor`: owns UI state for Pokemon, item, ability, nature, EVs, moves, and user corrections.
- `format-rules`: maps app formats to rule metadata, team size expectations, and data snapshot IDs.
- `data-store`: loads bundled snapshots and exposes typed lookup APIs.
- `audit-engine`: computes type coverage, defensive gaps, speed tiers, and role detection.
- `meta-threats`: ranks popular Pokemon from the selected format against the current team.
- `explanations`: converts raw findings into short user-facing reasons.

The UI should consume analysis results through stable view models instead of reaching directly into raw data files. This keeps the analysis logic testable and lets snapshots evolve without rewriting components.

## Analysis Rules

### Defensive Audit

The defensive audit detects:

- stacked weaknesses by type;
- missing resistances or immunities;
- Pokemon that are repeatedly forced to cover the same threat category;
- lack of clear switch-ins against common offensive types;
- format-specific team size concerns where relevant.

### Offensive Audit

The offensive audit detects:

- which defensive types are hit super effectively by known attacking moves;
- types that are barely covered or uncovered;
- overreliance on one Pokemon for important coverage;
- whether attacks are physical, special, or status when data is available.

### Role Detection

Role detection is intentionally simple and rule-based in V1. It can identify:

- speed control;
- hazard setter;
- hazard removal;
- pivoting;
- priority;
- setup sweeper;
- bulky support;
- recovery;
- status spreading.

The result should include confidence or evidence, not just a label.

### Speed Tiers

Speed analysis compares team members against relevant thresholds for the selected format. If exact EV/nature data is missing, the app marks the speed result as estimated.

### Meta Threats

Threat scoring combines:

- usage rank or usage percentage;
- offensive pressure into the team, based on known or assumed STAB and common coverage;
- team defensive answers, including resistances and immunities;
- speed relationship when available;
- whether only one team member checks the threat.

The output should be a ranked list with plain explanations, for example: "outspeeds four members, hits three super effectively, and only one Pokemon resists its main STAB."

## Error Handling

Showdown paste errors:

- report the line or block that could not be parsed;
- keep valid team members when possible;
- surface unknown Pokemon, moves, items, or abilities as data gaps.

Data errors:

- missing reference snapshot disables affected analysis sections;
- missing usage snapshot keeps team audit enabled and disables meta threats;
- demo or fallback data is clearly labeled;
- stale data is visible through snapshot metadata.

Runtime behavior:

- no silent failures;
- no opaque "bad team" score;
- every warning should show enough evidence to be actionable.

## Testing

Unit tests:

- Showdown paste parser with common real-world paste variants;
- type chart multipliers, including immunities;
- defensive and offensive coverage summaries;
- role detection from moves/items/abilities;
- threat scoring on small controlled fixtures;
- format switching without data leakage between VGC, BSS, and OU.

UI tests or component tests:

- empty app state;
- invalid paste;
- valid team with complete data;
- missing usage snapshot;
- demo snapshot warning;
- changing format recalculates analysis.

## Implementation Notes

Use local dependencies that match the app's needs:

- React and Vite for the frontend;
- TypeScript for data models and analysis logic;
- `@pkmn` packages where they reduce custom Pokemon parsing or data handling;
- local JSON fixtures for early snapshots.

The first implementation should prioritize correctness and clear boundaries over a large dataset. A small but typed demo snapshot is acceptable if the data loader is designed for real snapshots.

## Acceptance Criteria

The V1 implementation is acceptable when:

- the app launches locally in a browser;
- a user can paste a Showdown team and see six parsed slots;
- the user can choose Champions VGC, BSS, or OU;
- the audit updates when team data or format changes;
- missing data states are explicit;
- meta threats are ranked from the selected format snapshot;
- every threat includes a short reason;
- tests cover parser, audit engine, and threat scoring basics.
