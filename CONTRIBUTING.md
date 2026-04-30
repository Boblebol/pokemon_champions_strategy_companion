# Contributing

The project is not attached to a public remote yet. Once it is public,
contributions should stay focused on local strategy analysis and reliable data
handling.

## Local Setup

```bash
npm install
npm run dev
```

## Checks

```bash
npm run check
```

## Pull Requests

- Keep changes small and covered by Vitest where behavior changes.
- Preserve offline behavior; Smogon fetch failures must leave the app usable.
- Do not add private API keys or paid service dependencies.
