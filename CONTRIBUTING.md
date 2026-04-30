# Contributing

Thanks for considering a contribution. This project should stay focused on
local strategy analysis, reliable Pokemon data handling, and a usable offline
fallback when live usage data cannot be fetched.

## Local Setup

```bash
pnpm install
pnpm run dev
```

## Checks

```bash
pnpm run check
```

## Pull Requests

- Keep changes small and covered by Vitest where behavior changes.
- Preserve offline behavior; Smogon fetch failures must leave the app usable.
- Do not add private API keys or paid service dependencies.
- Keep generated or agent-private planning files out of the repository.
