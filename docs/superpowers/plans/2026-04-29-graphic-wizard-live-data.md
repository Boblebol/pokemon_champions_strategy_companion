# Graphic Wizard And Live Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a French graphical V1.1 with setup wizard, inline help, Smogon usage refresh, and cleaner repo hygiene.

**Architecture:** Keep the local React/Vite app architecture. Add small focused UI components for the wizard and help, expand the snapshot refresh domain module to parse Smogon chaos JSON into the existing `MetaSnapshot` shape, and keep bundled snapshots as the offline fallback.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, CSS modules via global `src/styles.css`.

---

### Task 1: French Graphical Wizard

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Create: `src/components/SetupWizard.tsx`
- Create: `src/components/HelpPanel.tsx`
- Modify: `src/components/TeamInput.tsx`
- Modify: `src/components/TeamPreview.tsx`
- Modify: `src/components/AuditPanel.tsx`
- Modify: `src/components/ThreatPanel.tsx`
- Modify: `src/components/SnapshotStatus.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing UI tests**

Add assertions for French title, wizard steps, help content, and dashboard headings.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/App.test.tsx`
Expected: FAIL because wizard/help/French headings do not exist yet.

- [ ] **Step 3: Implement minimal UI**

Add `SetupWizard` and `HelpPanel`, translate visible labels, and restyle the dashboard with stable responsive cards.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/App.test.tsx`
Expected: PASS.

### Task 2: Smogon Usage Refresh

**Files:**
- Modify: `src/domain/snapshotRefresh.test.ts`
- Modify: `src/domain/snapshotRefresh.ts`
- Modify: `src/domain/types.ts`
- Modify: `src/domain/dataStore.ts`
- Modify: `src/App.tsx`
- Modify: `src/domain/analysis.test.ts`
- Modify: `src/domain/analysis.ts`

- [ ] **Step 1: Write failing refresh tests**

Add a test showing a Smogon chaos payload is converted into a live `MetaSnapshot`, and tests for non-OK and invalid payload fallback messages.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/domain/snapshotRefresh.test.ts`
Expected: FAIL because refresh currently only checks a Pokedex endpoint.

- [ ] **Step 3: Implement refresh parser**

Fetch the format-specific Smogon chaos JSON, convert top entries into usage rows, attach source/date/battle count, and return snapshots that can be merged into app state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/domain/snapshotRefresh.test.ts src/domain/analysis.test.ts`
Expected: PASS.

### Task 3: Repository Hygiene

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`
- Create: `.editorconfig`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Add repo checks**

Add `npm run check`, move build/test tooling to `devDependencies`, remove unused packages, and update lockfile with `npm install`.

- [ ] **Step 2: Verify**

Run: `npm run check`
Expected: lint, tests, and build all pass.

- [ ] **Step 3: Commit**

Commit the completed iteration after final verification.
