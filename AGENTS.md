# Agent Instructions

This repository is a local-first React/Vite application for Pokemon Champions
team building and strategy analysis.

## Project Rules

- Use `pnpm` for dependency management and scripts.
- Run `pnpm run check` before publishing changes.
- Keep private planning notes, generated agent memory, and Superpowers docs out
  of Git. `docs/superpowers/` is intentionally ignored.
- Preserve offline behavior. Live Smogon usage fetches must fail gracefully and
  keep the local demo snapshots usable.
- Keep UI copy in French unless a change explicitly targets developer docs.

## Useful Commands

```bash
pnpm install
pnpm run dev
pnpm run check
make dev
make check
```
