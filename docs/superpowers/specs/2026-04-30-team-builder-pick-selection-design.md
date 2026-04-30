# Team Builder Pick Selection Design

## Goal

Add a simple integrated team builder that lets users build a six-Pokemon Champions roster without writing Showdown text by hand, then analyze the actual match selection separately from the full roster.

## Scope

- A local builder fed by the current reference data bundle.
- Six roster slots with Pokemon search/select.
- Per-slot editable details: item, ability, four moves from known move data, EVs, nature, and a free-form comment.
- A match selection panel:
  - Champions Singles/BSS selects 3 from 6.
  - Champions VGC/Doubles selects 4 from 6.
  - Champions OU remains treated as a 6-slot full-team analysis until a Champions-specific singles queue replaces it.
- Analysis compares:
  - full roster weaknesses and roles,
  - selected match team weaknesses and threats,
  - warnings when selected count is incomplete or a selected core stacks weaknesses.
- Showdown paste remains supported. The builder can initialize from the current paste and can generate a paste from builder state.

## Decisions

- Keep this V1 local. No persistence, auth, account, or remote storage.
- Use the existing demo reference bundle first. The UI will show the available Pokemon/moves from local data, and the domain model will accept more data later.
- Keep comments internal to the builder. They are not exported to Showdown paste.
- Singles/BSS is corrected to "team of 6, pick 3"; VGC is "team of 6, pick 4" based on the current Champions rules references checked on 2026-04-30.

## UX

The builder is a practical work surface inside the app, not a separate landing page. It should use a compact catalog, six slot cards, a selected-for-match row, and simple controls for EVs/moves/comments. The existing paste import remains available so advanced users can keep their workflow.

## Testing

Tests must cover:

- building a roster from local Pokemon and move options,
- generating a Showdown paste from the builder,
- deriving pick size from format,
- analyzing selected pick-3 separately from the six-slot roster,
- warnings for incomplete selections,
- UI controls for selecting Pokemon, moves, EVs, comments, and match picks.
