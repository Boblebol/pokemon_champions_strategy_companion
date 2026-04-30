# Team Builder Pick Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local team builder and correct Champions analysis around six-slot rosters with match pick selection.

**Architecture:** Add a focused `teamBuilder` domain module that converts between builder state, parsed team members, and Showdown paste. Extend analysis to accept an optional match-selection subset so the app can compare full roster findings with selected-core findings. Add React components for roster slots, match pick toggles, and comments while reusing existing audit/threat components.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, existing local demo data bundle.

---

### Task 1: Builder Domain Model

**Files:**
- Create: `src/domain/teamBuilder.ts`
- Create: `src/domain/teamBuilder.test.ts`
- Modify: `src/domain/types.ts`

- [ ] Write failing tests for empty six-slot state, setting a Pokemon, setting moves/EVs/comments, conversion to `TeamMember[]`, and Showdown export.
- [ ] Run `npm run test -- src/domain/teamBuilder.test.ts`; expect failure because module does not exist.
- [ ] Implement `TeamBuilderState`, `BuilderSlot`, `createEmptyBuilderState`, `updateBuilderSlot`, `builderStateToMembers`, and `builderStateToShowdownPaste`.
- [ ] Run `npm run test -- src/domain/teamBuilder.test.ts`; expect pass.
- [ ] Commit `feat: add team builder domain model`.

### Task 2: Pick Rules And Selected Analysis

**Files:**
- Modify: `src/domain/formatRules.ts`
- Modify: `src/domain/analysis.ts`
- Modify: `src/domain/analysis.test.ts`
- Create: `src/domain/matchSelection.ts`
- Create: `src/domain/matchSelection.test.ts`

- [ ] Write failing tests for `getPickSize`: BSS selects 3, VGC selects 4, OU uses 6.
- [ ] Write failing tests showing `analyzeTeam` returns full roster audit plus selected-team audit when selected slot ids are provided.
- [ ] Run targeted tests; expect failure because pick rules and selected analysis are missing.
- [ ] Implement `getPickSize`, `selectMembersForMatch`, `selectionWarnings`, and extend `AnalysisResult` with `selectedTeam`, `selectedAudit`, `selectedThreats`, and `selectionWarnings`.
- [ ] Run targeted tests; expect pass.
- [ ] Commit `feat: analyze match pick selection`.

### Task 3: Builder UI

**Files:**
- Create: `src/components/TeamBuilder.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

- [ ] Write failing UI tests for builder heading, Pokemon slot select, move select, EV inputs, comment field, match pick toggles, and selected analysis heading.
- [ ] Run `npm run test -- src/App.test.tsx`; expect failure because builder UI is absent.
- [ ] Implement `TeamBuilder` with six slot cards, local Pokemon/move options, EV inputs, comments, and pick toggles constrained by format pick size.
- [ ] Wire builder state into `App`, generate paste for existing analysis, and pass selected slots into `analyzeTeam`.
- [ ] Run `npm run test -- src/App.test.tsx`; expect pass.
- [ ] Commit `feat: add integrated team builder`.

### Task 4: Polish, Docs, Verification

**Files:**
- Modify: `README.md`
- Modify: `src/styles.css`
- Modify: relevant tests if copy changes require it.

- [ ] Update README with the builder and pick-selection workflow.
- [ ] Run `npm run check`.
- [ ] Start Vite locally and verify the app renders.
- [ ] Capture desktop and mobile screenshots with headless Chrome.
- [ ] Commit `docs: document team builder workflow`.
