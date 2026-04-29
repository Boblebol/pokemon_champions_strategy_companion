# Pokemon Champions Strategy Companion V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local React/Vite app that imports a Showdown team, audits it for Champions formats, and ranks meta threats from local snapshots.

**Architecture:** The app is client-side first. Domain logic lives in focused TypeScript modules under `src/domain`, bundled demo snapshots live under `src/data`, and React components consume stable analysis view models instead of raw fixture data.

**Tech Stack:** React, Vite, TypeScript, Vitest, Testing Library, local JSON-like TypeScript fixtures, browser `fetch` for snapshot refresh attempts.

---

## File Structure

Create this structure:

```text
package.json
index.html
tsconfig.json
tsconfig.node.json
vite.config.ts
vitest.config.ts
src/main.tsx
src/App.tsx
src/App.test.tsx
src/styles.css
src/components/FormatSelector.tsx
src/components/SnapshotStatus.tsx
src/components/TeamInput.tsx
src/components/TeamPreview.tsx
src/components/AuditPanel.tsx
src/components/ThreatPanel.tsx
src/data/demoSnapshots.ts
src/domain/analysis.ts
src/domain/analysis.test.ts
src/domain/auditEngine.ts
src/domain/auditEngine.test.ts
src/domain/dataStore.ts
src/domain/dataStore.test.ts
src/domain/formatRules.ts
src/domain/ids.ts
src/domain/metaThreats.ts
src/domain/metaThreats.test.ts
src/domain/roleDetection.ts
src/domain/snapshotRefresh.ts
src/domain/snapshotRefresh.test.ts
src/domain/teamImport.ts
src/domain/teamImport.test.ts
src/domain/typeEffectiveness.ts
src/domain/typeEffectiveness.test.ts
src/domain/types.ts
src/test/setup.ts
README.md
```

Responsibilities:

- `types.ts`: shared domain contracts.
- `ids.ts`: Pokemon Showdown-style ID normalization.
- `formatRules.ts`: supported app formats and labels.
- `demoSnapshots.ts`: small typed reference and meta snapshots for V1.
- `dataStore.ts`: snapshot lookup and state helpers.
- `teamImport.ts`: Showdown paste parser.
- `typeEffectiveness.ts`: type chart multipliers and coverage helpers.
- `roleDetection.ts`: rule-based role detection from moves.
- `auditEngine.ts`: defensive/offensive/speed/role audit.
- `metaThreats.ts`: usage-driven threat ranking.
- `analysis.ts`: composes audit and threat view model for UI.
- `snapshotRefresh.ts`: refresh adapters and explicit error results.
- `components/*`: presentational UI.

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Create package and tooling files**

Write `package.json`:

```json
{
  "name": "pokemon-champions-strategy-companion",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest --run",
    "test:watch": "vitest",
    "lint": "tsc -b --pretty false"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^6.0.0",
    "typescript": "^5.6.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "vitest": "^2.1.0"
  }
}
```

Write `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pokemon Champions Strategy Companion</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Write `tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

Write `vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
});
```

Write `vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

Append to `.gitignore`:

```gitignore
node_modules/
dist/
coverage/
.vite/
```

- [ ] **Step 2: Create a minimal app shell**

Write `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

Write `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Write `src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <h1>Pokemon Champions Strategy Companion</h1>
      <p>Local team audit and meta threat companion.</p>
    </main>
  );
}
```

Write `src/styles.css`:

```css
:root {
  color: #102033;
  background: #f5f7fb;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}
```

- [ ] **Step 3: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and dependencies install successfully.

- [ ] **Step 4: Verify scaffold**

Run:

```bash
npm run lint
npm run build
```

Expected: TypeScript and Vite build both succeed.

- [ ] **Step 5: Commit scaffold**

```bash
git add .gitignore package.json package-lock.json index.html tsconfig.json tsconfig.node.json vite.config.ts vitest.config.ts src/main.tsx src/App.tsx src/styles.css src/test/setup.ts
git commit -m "chore: scaffold local web app"
```

## Task 2: Domain Types, Formats, and Demo Snapshots

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/ids.ts`
- Create: `src/domain/formatRules.ts`
- Create: `src/data/demoSnapshots.ts`
- Create: `src/domain/dataStore.ts`
- Create: `src/domain/dataStore.test.ts`

- [ ] **Step 1: Write failing data-store tests**

Write `src/domain/dataStore.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { createDataStore } from './dataStore';
import { SUPPORTED_FORMATS } from './formatRules';
import { demoDataBundle } from '../data/demoSnapshots';

describe('dataStore', () => {
  it('finds reference Pokemon and moves by normalized id', () => {
    const store = createDataStore(demoDataBundle);

    expect(store.getPokemon('Great Tusk')?.name).toBe('Great Tusk');
    expect(store.getPokemon('greattusk')?.types).toEqual(['Ground', 'Fighting']);
    expect(store.getMove('Thunderbolt')?.type).toBe('Electric');
  });

  it('returns the format-specific meta snapshot without mixing formats', () => {
    const store = createDataStore(demoDataBundle);

    expect(store.getMetaSnapshot('champions-vgc')?.format).toBe('champions-vgc');
    expect(store.getMetaSnapshot('champions-bss')?.format).toBe('champions-bss');
    expect(store.getMetaSnapshot('champions-vgc')?.entries[0].species).not.toBe(
      store.getMetaSnapshot('champions-bss')?.entries[0].species,
    );
  });

  it('exposes all V1 formats with user-facing labels', () => {
    expect(SUPPORTED_FORMATS.map((format) => format.label)).toEqual([
      'Champions VGC',
      'Champions BSS',
      'Champions OU',
    ]);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- src/domain/dataStore.test.ts
```

Expected: FAIL because `dataStore`, `formatRules`, and demo snapshots do not exist.

- [ ] **Step 3: Add shared domain contracts**

Write `src/domain/types.ts`:

```ts
export const POKEMON_TYPES = [
  'Normal',
  'Fire',
  'Water',
  'Electric',
  'Grass',
  'Ice',
  'Fighting',
  'Poison',
  'Ground',
  'Flying',
  'Psychic',
  'Bug',
  'Rock',
  'Ghost',
  'Dragon',
  'Dark',
  'Steel',
  'Fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export type StatId = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export type StatTable = Partial<Record<StatId, number>>;

export type MoveCategory = 'Physical' | 'Special' | 'Status';

export type FormatId = 'champions-vgc' | 'champions-bss' | 'champions-ou';

export interface FormatDefinition {
  id: FormatId;
  label: string;
  battleStyle: 'doubles' | 'singles' | 'six-vs-six';
  teamSize: number;
  defaultLevel: number;
}

export interface PokemonReference {
  id: string;
  name: string;
  types: PokemonType[];
  baseStats: Required<StatTable>;
}

export interface MoveReference {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power?: number;
}

export interface ReferenceSnapshot {
  id: string;
  source: string;
  importedAt: string;
  pokemon: Record<string, PokemonReference>;
  moves: Record<string, MoveReference>;
}

export interface UsageEntry {
  rank: number;
  species: string;
  usage: number;
  commonMoves: string[];
}

export interface MetaSnapshot {
  id: string;
  format: FormatId;
  label: string;
  source: string;
  date: string;
  importedAt: string;
  battleCount?: number;
  isDemo: boolean;
  entries: UsageEntry[];
}

export interface DataBundle {
  reference: ReferenceSnapshot;
  meta: Record<FormatId, MetaSnapshot>;
}

export interface TeamMember {
  slot: number;
  nickname?: string;
  species: string;
  item?: string;
  ability?: string;
  level?: number;
  teraType?: PokemonType;
  nature?: string;
  evs: StatTable;
  moves: string[];
  parseWarnings: string[];
}

export interface ParsedTeam {
  members: TeamMember[];
  errors: string[];
}
```

Write `src/domain/ids.ts`:

```ts
export function toId(value: string | undefined): string {
  return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}
```

Write `src/domain/formatRules.ts`:

```ts
import type { FormatDefinition } from './types';

export const SUPPORTED_FORMATS: FormatDefinition[] = [
  {
    id: 'champions-vgc',
    label: 'Champions VGC',
    battleStyle: 'doubles',
    teamSize: 6,
    defaultLevel: 50,
  },
  {
    id: 'champions-bss',
    label: 'Champions BSS',
    battleStyle: 'singles',
    teamSize: 6,
    defaultLevel: 50,
  },
  {
    id: 'champions-ou',
    label: 'Champions OU',
    battleStyle: 'six-vs-six',
    teamSize: 6,
    defaultLevel: 100,
  },
];

export function getFormatDefinition(formatId: FormatDefinition['id']) {
  return SUPPORTED_FORMATS.find((format) => format.id === formatId);
}
```

- [ ] **Step 4: Add typed demo snapshots**

Write `src/data/demoSnapshots.ts` with at least these exact entries:

```ts
import type { DataBundle, MoveReference, PokemonReference } from '../domain/types';

const pokemon: Record<string, PokemonReference> = {
  greattusk: {
    id: 'greattusk',
    name: 'Great Tusk',
    types: ['Ground', 'Fighting'],
    baseStats: { hp: 115, atk: 131, def: 131, spa: 53, spd: 53, spe: 87 },
  },
  fluttermane: {
    id: 'fluttermane',
    name: 'Flutter Mane',
    types: ['Ghost', 'Fairy'],
    baseStats: { hp: 55, atk: 55, def: 55, spa: 135, spd: 135, spe: 135 },
  },
  kingambit: {
    id: 'kingambit',
    name: 'Kingambit',
    types: ['Dark', 'Steel'],
    baseStats: { hp: 100, atk: 135, def: 120, spa: 60, spd: 85, spe: 50 },
  },
  dragonite: {
    id: 'dragonite',
    name: 'Dragonite',
    types: ['Dragon', 'Flying'],
    baseStats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
  },
  corviknight: {
    id: 'corviknight',
    name: 'Corviknight',
    types: ['Flying', 'Steel'],
    baseStats: { hp: 98, atk: 87, def: 105, spa: 53, spd: 85, spe: 67 },
  },
  rotomwash: {
    id: 'rotomwash',
    name: 'Rotom-Wash',
    types: ['Electric', 'Water'],
    baseStats: { hp: 50, atk: 65, def: 107, spa: 105, spd: 107, spe: 86 },
  },
  garchomp: {
    id: 'garchomp',
    name: 'Garchomp',
    types: ['Dragon', 'Ground'],
    baseStats: { hp: 108, atk: 130, def: 95, spa: 80, spd: 85, spe: 102 },
  },
  dondozo: {
    id: 'dondozo',
    name: 'Dondozo',
    types: ['Water'],
    baseStats: { hp: 150, atk: 100, def: 115, spa: 65, spd: 65, spe: 35 },
  },
  aegislash: {
    id: 'aegislash',
    name: 'Aegislash',
    types: ['Steel', 'Ghost'],
    baseStats: { hp: 60, atk: 50, def: 140, spa: 50, spd: 140, spe: 60 },
  },
  charizard: {
    id: 'charizard',
    name: 'Charizard',
    types: ['Fire', 'Flying'],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
  },
};

const moves: Record<string, MoveReference> = {
  earthquake: { id: 'earthquake', name: 'Earthquake', type: 'Ground', category: 'Physical', power: 100 },
  closecombat: { id: 'closecombat', name: 'Close Combat', type: 'Fighting', category: 'Physical', power: 120 },
  moonblast: { id: 'moonblast', name: 'Moonblast', type: 'Fairy', category: 'Special', power: 95 },
  shadowball: { id: 'shadowball', name: 'Shadow Ball', type: 'Ghost', category: 'Special', power: 80 },
  suckerpunch: { id: 'suckerpunch', name: 'Sucker Punch', type: 'Dark', category: 'Physical', power: 70 },
  ironhead: { id: 'ironhead', name: 'Iron Head', type: 'Steel', category: 'Physical', power: 80 },
  dragondance: { id: 'dragondance', name: 'Dragon Dance', type: 'Dragon', category: 'Status' },
  extremespeed: { id: 'extremespeed', name: 'Extreme Speed', type: 'Normal', category: 'Physical', power: 80 },
  roost: { id: 'roost', name: 'Roost', type: 'Flying', category: 'Status' },
  uturn: { id: 'uturn', name: 'U-turn', type: 'Bug', category: 'Physical', power: 70 },
  defog: { id: 'defog', name: 'Defog', type: 'Flying', category: 'Status' },
  thunderbolt: { id: 'thunderbolt', name: 'Thunderbolt', type: 'Electric', category: 'Special', power: 90 },
  hydropump: { id: 'hydropump', name: 'Hydro Pump', type: 'Water', category: 'Special', power: 110 },
  willowisp: { id: 'willowisp', name: 'Will-O-Wisp', type: 'Fire', category: 'Status' },
  stealthrock: { id: 'stealthrock', name: 'Stealth Rock', type: 'Rock', category: 'Status' },
  swordsdance: { id: 'swordsdance', name: 'Swords Dance', type: 'Normal', category: 'Status' },
  fireblast: { id: 'fireblast', name: 'Fire Blast', type: 'Fire', category: 'Special', power: 110 },
  icebeam: { id: 'icebeam', name: 'Ice Beam', type: 'Ice', category: 'Special', power: 90 },
};

export const demoDataBundle: DataBundle = {
  reference: {
    id: 'demo-reference-2026-04-29',
    source: 'Bundled demo data based on Pokemon Showdown-style records',
    importedAt: '2026-04-29T00:00:00.000Z',
    pokemon,
    moves,
  },
  meta: {
    'champions-vgc': {
      id: 'demo-vgc-2026-04',
      format: 'champions-vgc',
      label: 'Champions VGC Demo',
      source: 'Demo VGC usage snapshot',
      date: '2026-04',
      importedAt: '2026-04-29T00:00:00.000Z',
      battleCount: 1200,
      isDemo: true,
      entries: [
        { rank: 1, species: 'Flutter Mane', usage: 34.2, commonMoves: ['Moonblast', 'Shadow Ball'] },
        { rank: 2, species: 'Great Tusk', usage: 28.5, commonMoves: ['Earthquake', 'Close Combat'] },
        { rank: 3, species: 'Dragonite', usage: 21.1, commonMoves: ['Dragon Dance', 'Extreme Speed'] },
      ],
    },
    'champions-bss': {
      id: 'demo-bss-2026-04',
      format: 'champions-bss',
      label: 'Champions BSS Demo',
      source: 'Demo BSS usage snapshot',
      date: '2026-04',
      importedAt: '2026-04-29T00:00:00.000Z',
      battleCount: 900,
      isDemo: true,
      entries: [
        { rank: 1, species: 'Dragonite', usage: 31.4, commonMoves: ['Dragon Dance', 'Extreme Speed'] },
        { rank: 2, species: 'Kingambit', usage: 25.6, commonMoves: ['Sucker Punch', 'Iron Head'] },
        { rank: 3, species: 'Garchomp', usage: 18.9, commonMoves: ['Earthquake', 'Stealth Rock'] },
      ],
    },
    'champions-ou': {
      id: 'demo-ou-2026-04',
      format: 'champions-ou',
      label: 'Champions OU Demo',
      source: 'Demo OU usage snapshot',
      date: '2026-04',
      importedAt: '2026-04-29T00:00:00.000Z',
      battleCount: 2500,
      isDemo: true,
      entries: [
        { rank: 1, species: 'Great Tusk', usage: 35.2, commonMoves: ['Earthquake', 'Close Combat', 'Stealth Rock'] },
        { rank: 2, species: 'Kingambit', usage: 24.7, commonMoves: ['Sucker Punch', 'Iron Head', 'Swords Dance'] },
        { rank: 3, species: 'Corviknight', usage: 19.5, commonMoves: ['Roost', 'U-turn', 'Defog'] },
      ],
    },
  },
};
```

- [ ] **Step 5: Implement data store**

Write `src/domain/dataStore.ts`:

```ts
import { toId } from './ids';
import type { DataBundle, FormatId } from './types';

export function createDataStore(bundle: DataBundle) {
  return {
    reference: bundle.reference,
    getPokemon(name: string) {
      return bundle.reference.pokemon[toId(name)];
    },
    getMove(name: string) {
      return bundle.reference.moves[toId(name)];
    },
    getMetaSnapshot(format: FormatId) {
      return bundle.meta[format];
    },
  };
}

export type DataStore = ReturnType<typeof createDataStore>;
```

- [ ] **Step 6: Run data-store tests**

Run:

```bash
npm run test -- src/domain/dataStore.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit domain data foundation**

```bash
git add src/domain/types.ts src/domain/ids.ts src/domain/formatRules.ts src/data/demoSnapshots.ts src/domain/dataStore.ts src/domain/dataStore.test.ts
git commit -m "feat: add typed demo data store"
```

## Task 3: Showdown Paste Import

**Files:**
- Create: `src/domain/teamImport.ts`
- Create: `src/domain/teamImport.test.ts`

- [ ] **Step 1: Write failing parser tests**

Write `src/domain/teamImport.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseShowdownTeam } from './teamImport';

describe('parseShowdownTeam', () => {
  it('parses species, item, ability, tera type, EVs, nature, and moves', () => {
    const result = parseShowdownTeam(`
Great Tusk @ Booster Energy
Ability: Protosynthesis
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Close Combat
- Stealth Rock
- Ice Beam
`);

    expect(result.errors).toEqual([]);
    expect(result.members).toHaveLength(1);
    expect(result.members[0]).toMatchObject({
      slot: 1,
      species: 'Great Tusk',
      item: 'Booster Energy',
      ability: 'Protosynthesis',
      teraType: 'Ground',
      nature: 'Jolly',
      evs: { atk: 252, spd: 4, spe: 252 },
      moves: ['Earthquake', 'Close Combat', 'Stealth Rock', 'Ice Beam'],
    });
  });

  it('keeps valid members and reports malformed blocks', () => {
    const result = parseShowdownTeam(`
Not a real block without moves

Rotom-Wash @ Leftovers
Ability: Levitate
- Thunderbolt
- Hydro Pump
`);

    expect(result.members).toHaveLength(1);
    expect(result.members[0].species).toBe('Rotom-Wash');
    expect(result.errors[0]).toContain('Block 1');
  });

  it('supports nicknames with explicit species', () => {
    const result = parseShowdownTeam(`
Washer (Rotom-Wash) @ Leftovers
Ability: Levitate
- Thunderbolt
`);

    expect(result.members[0].nickname).toBe('Washer');
    expect(result.members[0].species).toBe('Rotom-Wash');
  });
});
```

- [ ] **Step 2: Run parser tests to verify failure**

Run:

```bash
npm run test -- src/domain/teamImport.test.ts
```

Expected: FAIL because `teamImport.ts` does not exist.

- [ ] **Step 3: Implement parser**

Write `src/domain/teamImport.ts`:

```ts
import type { ParsedTeam, PokemonType, StatId, StatTable, TeamMember } from './types';
import { POKEMON_TYPES } from './types';

const STAT_ALIASES: Record<string, StatId> = {
  HP: 'hp',
  Atk: 'atk',
  Def: 'def',
  SpA: 'spa',
  SpD: 'spd',
  Spe: 'spe',
};

function parseHeader(header: string) {
  const [namePart, itemPart] = header.split('@').map((part) => part.trim());
  const nicknameMatch = namePart.match(/^(.+)\s+\((.+)\)$/);

  return {
    nickname: nicknameMatch ? nicknameMatch[1].trim() : undefined,
    species: nicknameMatch ? nicknameMatch[2].trim() : namePart.trim(),
    item: itemPart || undefined,
  };
}

function parseEvs(line: string): StatTable {
  const evs: StatTable = {};
  const body = line.replace(/^EVs:\s*/i, '');

  for (const part of body.split('/')) {
    const match = part.trim().match(/^(\d+)\s+(HP|Atk|Def|SpA|SpD|Spe)$/);
    if (match) {
      evs[STAT_ALIASES[match[2]]] = Number(match[1]);
    }
  }

  return evs;
}

function parseTeraType(line: string): PokemonType | undefined {
  const value = line.replace(/^Tera Type:\s*/i, '').trim();
  return POKEMON_TYPES.includes(value as PokemonType) ? (value as PokemonType) : undefined;
}

function parseBlock(block: string, slot: number): TeamMember | string {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return `Block ${slot} is empty.`;
  }

  const header = parseHeader(lines[0]);
  const member: TeamMember = {
    slot,
    nickname: header.nickname,
    species: header.species,
    item: header.item,
    evs: {},
    moves: [],
    parseWarnings: [],
  };

  for (const line of lines.slice(1)) {
    if (/^Ability:/i.test(line)) {
      member.ability = line.replace(/^Ability:\s*/i, '').trim();
    } else if (/^Level:/i.test(line)) {
      member.level = Number(line.replace(/^Level:\s*/i, '').trim());
    } else if (/^Tera Type:/i.test(line)) {
      member.teraType = parseTeraType(line);
      if (!member.teraType) {
        member.parseWarnings.push(`Unknown Tera Type in line: ${line}`);
      }
    } else if (/^EVs:/i.test(line)) {
      member.evs = parseEvs(line);
    } else if (/^[A-Za-z]+ Nature$/i.test(line)) {
      member.nature = line.replace(/\s+Nature$/i, '').trim();
    } else if (line.startsWith('-')) {
      member.moves.push(line.replace(/^-\s*/, '').trim());
    }
  }

  if (!member.species || member.moves.length === 0) {
    return `Block ${slot} could not be parsed as a Pokemon set.`;
  }

  return member;
}

export function parseShowdownTeam(input: string): ParsedTeam {
  const blocks = input
    .split(/\n\s*\n/g)
    .map((block) => block.trim())
    .filter(Boolean);

  const members: TeamMember[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const parsed = parseBlock(block, index + 1);
    if (typeof parsed === 'string') {
      errors.push(parsed);
    } else {
      members.push({ ...parsed, slot: members.length + 1 });
    }
  });

  return { members, errors };
}
```

- [ ] **Step 4: Run parser tests**

Run:

```bash
npm run test -- src/domain/teamImport.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit parser**

```bash
git add src/domain/teamImport.ts src/domain/teamImport.test.ts
git commit -m "feat: parse showdown teams"
```

## Task 4: Type Effectiveness

**Files:**
- Create: `src/domain/typeEffectiveness.ts`
- Create: `src/domain/typeEffectiveness.test.ts`

- [ ] **Step 1: Write failing type-effectiveness tests**

Write `src/domain/typeEffectiveness.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getDefensiveMultiplier, getWeaknessSummary } from './typeEffectiveness';

describe('typeEffectiveness', () => {
  it('calculates immunities and double weaknesses', () => {
    expect(getDefensiveMultiplier('Electric', ['Ground'])).toBe(0);
    expect(getDefensiveMultiplier('Ice', ['Dragon', 'Flying'])).toBe(4);
    expect(getDefensiveMultiplier('Fire', ['Steel', 'Flying'])).toBe(2);
  });

  it('summarizes stacked team weaknesses', () => {
    const summary = getWeaknessSummary([
      { name: 'Garchomp', types: ['Dragon', 'Ground'] },
      { name: 'Dragonite', types: ['Dragon', 'Flying'] },
      { name: 'Great Tusk', types: ['Ground', 'Fighting'] },
    ]);

    expect(summary.find((entry) => entry.type === 'Ice')?.weakCount).toBe(3);
    expect(summary.find((entry) => entry.type === 'Ice')?.quadWeak).toEqual(['Garchomp', 'Dragonite']);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- src/domain/typeEffectiveness.test.ts
```

Expected: FAIL because `typeEffectiveness.ts` does not exist.

- [ ] **Step 3: Implement type chart helpers**

Write `src/domain/typeEffectiveness.ts` with a compact non-neutral chart:

```ts
import type { PokemonType } from './types';
import { POKEMON_TYPES } from './types';

type TypeMatchups = Partial<Record<PokemonType, number>>;

const ATTACKING_TYPE_CHART: Record<PokemonType, TypeMatchups> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

export function getDefensiveMultiplier(attackType: PokemonType, defenderTypes: PokemonType[]): number {
  return defenderTypes.reduce((multiplier, defenderType) => {
    return multiplier * (ATTACKING_TYPE_CHART[attackType][defenderType] ?? 1);
  }, 1);
}

export function getWeaknessSummary(team: Array<{ name: string; types: PokemonType[] }>) {
  return POKEMON_TYPES.map((type) => {
    const weakTo = team.filter((member) => getDefensiveMultiplier(type, member.types) > 1);
    const resistOrImmune = team.filter((member) => getDefensiveMultiplier(type, member.types) < 1);
    const quadWeak = team
      .filter((member) => getDefensiveMultiplier(type, member.types) >= 4)
      .map((member) => member.name);

    return {
      type,
      weakCount: weakTo.length,
      resistOrImmuneCount: resistOrImmune.length,
      weakTo: weakTo.map((member) => member.name),
      quadWeak,
    };
  }).sort((a, b) => b.weakCount - a.weakCount);
}
```

- [ ] **Step 4: Run type-effectiveness tests**

Run:

```bash
npm run test -- src/domain/typeEffectiveness.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit type effectiveness**

```bash
git add src/domain/typeEffectiveness.ts src/domain/typeEffectiveness.test.ts
git commit -m "feat: add type effectiveness helpers"
```

## Task 5: Team Audit Engine

**Files:**
- Create: `src/domain/roleDetection.ts`
- Create: `src/domain/auditEngine.ts`
- Create: `src/domain/auditEngine.test.ts`

- [ ] **Step 1: Write failing audit tests**

Write `src/domain/auditEngine.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { createDataStore } from './dataStore';
import { auditTeam } from './auditEngine';
import type { TeamMember } from './types';

const store = createDataStore(demoDataBundle);

function member(species: string, moves: string[], evs = {}): TeamMember {
  return { slot: 1, species, moves, evs, parseWarnings: [] };
}

describe('auditTeam', () => {
  it('reports stacked weaknesses with evidence', () => {
    const result = auditTeam({
      team: [
        member('Garchomp', ['Earthquake']),
        member('Dragonite', ['Extreme Speed']),
        member('Great Tusk', ['Close Combat']),
      ],
      store,
      format: 'champions-ou',
    });

    expect(result.defensive[0].title).toContain('Ice');
    expect(result.defensive[0].evidence.join(' ')).toContain('Garchomp');
  });

  it('reports offensive coverage and missing roles', () => {
    const result = auditTeam({
      team: [
        member('Corviknight', ['Roost', 'Defog', 'U-turn']),
        member('Rotom-Wash', ['Thunderbolt', 'Hydro Pump', 'Will-O-Wisp']),
      ],
      store,
      format: 'champions-bss',
    });

    expect(result.offensive.some((finding) => finding.title.includes('Offensive coverage'))).toBe(true);
    expect(result.roles.detected.map((role) => role.role)).toContain('hazard removal');
    expect(result.roles.missing).toContain('speed control');
  });

  it('marks speed tiers as estimated when EVs are incomplete', () => {
    const result = auditTeam({
      team: [member('Kingambit', ['Sucker Punch'])],
      store,
      format: 'champions-vgc',
    });

    expect(result.speed[0].estimated).toBe(true);
  });
});
```

- [ ] **Step 2: Run audit tests to verify failure**

Run:

```bash
npm run test -- src/domain/auditEngine.test.ts
```

Expected: FAIL because `auditEngine.ts` does not exist.

- [ ] **Step 3: Implement role detection**

Write `src/domain/roleDetection.ts`:

```ts
import { toId } from './ids';
import type { TeamMember } from './types';

export type TeamRole =
  | 'speed control'
  | 'hazard setter'
  | 'hazard removal'
  | 'pivot'
  | 'priority'
  | 'setup sweeper'
  | 'bulky support'
  | 'recovery'
  | 'status spreading';

const MOVE_ROLES: Record<string, TeamRole[]> = {
  dragondance: ['speed control', 'setup sweeper'],
  stealthrock: ['hazard setter'],
  defog: ['hazard removal'],
  rapidspin: ['hazard removal'],
  uturn: ['pivot'],
  voltswitch: ['pivot'],
  suckerpunch: ['priority'],
  extremespeed: ['priority'],
  swordsdance: ['setup sweeper'],
  roost: ['recovery', 'bulky support'],
  recover: ['recovery', 'bulky support'],
  willowisp: ['status spreading', 'bulky support'],
  thunderwave: ['speed control', 'status spreading'],
};

export interface DetectedRole {
  role: TeamRole;
  member: string;
  evidence: string;
}

export function detectRoles(team: TeamMember[]) {
  const detected: DetectedRole[] = [];

  for (const member of team) {
    for (const move of member.moves) {
      for (const role of MOVE_ROLES[toId(move)] ?? []) {
        detected.push({ role, member: member.species, evidence: move });
      }
    }
  }

  const present = new Set(detected.map((entry) => entry.role));
  const required: TeamRole[] = ['speed control', 'hazard removal', 'pivot', 'priority'];
  const missing = required.filter((role) => !present.has(role));

  return { detected, missing };
}
```

- [ ] **Step 4: Implement audit engine**

Write `src/domain/auditEngine.ts`:

```ts
import type { DataStore } from './dataStore';
import { detectRoles } from './roleDetection';
import { getDefensiveMultiplier, getWeaknessSummary } from './typeEffectiveness';
import type { FormatId, PokemonType, TeamMember } from './types';
import { POKEMON_TYPES } from './types';

export interface AuditFinding {
  severity: 'high' | 'medium' | 'low';
  title: string;
  evidence: string[];
}

export interface SpeedFinding {
  species: string;
  speed: number;
  estimated: boolean;
  note: string;
}

export interface TeamAudit {
  defensive: AuditFinding[];
  offensive: AuditFinding[];
  roles: ReturnType<typeof detectRoles>;
  speed: SpeedFinding[];
  dataWarnings: string[];
}

function resolveTeamTypes(team: TeamMember[], store: DataStore) {
  return team.flatMap((member) => {
    const reference = store.getPokemon(member.species);
    return reference ? [{ name: reference.name, types: reference.types }] : [];
  });
}

function buildDefensiveFindings(team: TeamMember[], store: DataStore): AuditFinding[] {
  const typedMembers = resolveTeamTypes(team, store);
  const summary = getWeaknessSummary(typedMembers);

  return summary
    .filter((entry) => entry.weakCount >= 2)
    .slice(0, 5)
    .map((entry) => ({
      severity: entry.weakCount >= 3 ? 'high' : 'medium',
      title: `${entry.type} pressure: ${entry.weakCount} team members weak`,
      evidence: [
        `Weak: ${entry.weakTo.join(', ')}`,
        entry.quadWeak.length > 0 ? `4x weak: ${entry.quadWeak.join(', ')}` : 'No 4x weakness',
        `${entry.resistOrImmuneCount} resist or are immune`,
      ],
    }));
}

function buildOffensiveFindings(team: TeamMember[], store: DataStore): AuditFinding[] {
  const coveredTypes = new Set<PokemonType>();

  for (const member of team) {
    for (const moveName of member.moves) {
      const move = store.getMove(moveName);
      if (!move || move.category === 'Status') {
        continue;
      }
      for (const type of POKEMON_TYPES) {
        if (getDefensiveMultiplier(move.type, [type]) > 1) {
          coveredTypes.add(type);
        }
      }
    }
  }

  const missing = POKEMON_TYPES.filter((type) => !coveredTypes.has(type));

  return [
    {
      severity: missing.length > 8 ? 'high' : missing.length > 4 ? 'medium' : 'low',
      title: `Offensive coverage: ${coveredTypes.size} defensive types covered by attacking moves`,
      evidence: [`Missing super-effective coverage into: ${missing.join(', ') || 'none'}`],
    },
  ];
}

function estimateSpeed(member: TeamMember, store: DataStore): SpeedFinding | undefined {
  const reference = store.getPokemon(member.species);
  if (!reference) {
    return undefined;
  }

  const hasSpeedEvs = typeof member.evs.spe === 'number';
  const speed = reference.baseStats.spe + Math.floor((member.evs.spe ?? 0) / 8);

  return {
    species: reference.name,
    speed,
    estimated: !hasSpeedEvs || !member.nature,
    note: hasSpeedEvs ? 'Uses entered Speed EVs.' : 'No Speed EVs entered; base Speed estimate only.',
  };
}

export function auditTeam({
  team,
  store,
}: {
  team: TeamMember[];
  store: DataStore;
  format: FormatId;
}): TeamAudit {
  const dataWarnings = team
    .filter((member) => !store.getPokemon(member.species))
    .map((member) => `Unknown Pokemon: ${member.species}`);

  return {
    defensive: buildDefensiveFindings(team, store),
    offensive: buildOffensiveFindings(team, store),
    roles: detectRoles(team),
    speed: team.flatMap((member) => estimateSpeed(member, store) ?? []),
    dataWarnings,
  };
}
```

- [ ] **Step 5: Run audit tests**

Run:

```bash
npm run test -- src/domain/auditEngine.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit audit engine**

```bash
git add src/domain/roleDetection.ts src/domain/auditEngine.ts src/domain/auditEngine.test.ts
git commit -m "feat: add team audit engine"
```

## Task 6: Meta Threat Ranking

**Files:**
- Create: `src/domain/metaThreats.ts`
- Create: `src/domain/metaThreats.test.ts`

- [ ] **Step 1: Write failing threat ranking tests**

Write `src/domain/metaThreats.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { createDataStore } from './dataStore';
import { rankMetaThreats } from './metaThreats';
import type { TeamMember } from './types';

const store = createDataStore(demoDataBundle);

function member(species: string, moves: string[] = []): TeamMember {
  return { slot: 1, species, moves, evs: {}, parseWarnings: [] };
}

describe('rankMetaThreats', () => {
  it('uses the selected format snapshot only', () => {
    const threats = rankMetaThreats({
      team: [member('Corviknight')],
      store,
      format: 'champions-bss',
      limit: 2,
    });

    expect(threats.map((threat) => threat.species)).toEqual(['Dragonite', 'Kingambit']);
  });

  it('explains why a high-usage attacker is dangerous', () => {
    const threats = rankMetaThreats({
      team: [member('Garchomp'), member('Dragonite'), member('Great Tusk')],
      store,
      format: 'champions-vgc',
      limit: 1,
    });

    expect(threats[0].species).toBe('Flutter Mane');
    expect(threats[0].reasons.join(' ')).toContain('usage');
    expect(threats[0].reasons.join(' ')).toContain('super effectively');
  });
});
```

- [ ] **Step 2: Run threat tests to verify failure**

Run:

```bash
npm run test -- src/domain/metaThreats.test.ts
```

Expected: FAIL because `metaThreats.ts` does not exist.

- [ ] **Step 3: Implement threat ranking**

Write `src/domain/metaThreats.ts`:

```ts
import type { DataStore } from './dataStore';
import { getDefensiveMultiplier } from './typeEffectiveness';
import type { FormatId, TeamMember } from './types';

export interface RankedThreat {
  species: string;
  rank: number;
  usage: number;
  score: number;
  severity: 'high' | 'medium' | 'low';
  reasons: string[];
}

function countSuperEffectiveTargets(attackingMoves: string[], team: TeamMember[], store: DataStore) {
  let count = 0;

  for (const member of team) {
    const defender = store.getPokemon(member.species);
    if (!defender) {
      continue;
    }

    const isHit = attackingMoves.some((moveName) => {
      const move = store.getMove(moveName);
      return move ? getDefensiveMultiplier(move.type, defender.types) > 1 : false;
    });

    if (isHit) {
      count += 1;
    }
  }

  return count;
}

function countResists(attackingMoves: string[], team: TeamMember[], store: DataStore) {
  let count = 0;

  for (const member of team) {
    const defender = store.getPokemon(member.species);
    if (!defender) {
      continue;
    }

    const resistsAllKnownAttacks = attackingMoves.every((moveName) => {
      const move = store.getMove(moveName);
      return move ? getDefensiveMultiplier(move.type, defender.types) < 1 : false;
    });

    if (resistsAllKnownAttacks && attackingMoves.length > 0) {
      count += 1;
    }
  }

  return count;
}

export function rankMetaThreats({
  team,
  store,
  format,
  limit = 10,
}: {
  team: TeamMember[];
  store: DataStore;
  format: FormatId;
  limit?: number;
}): RankedThreat[] {
  const snapshot = store.getMetaSnapshot(format);

  if (!snapshot) {
    return [];
  }

  return snapshot.entries
    .map((entry) => {
      const superEffectiveTargets = countSuperEffectiveTargets(entry.commonMoves, team, store);
      const resists = countResists(entry.commonMoves, team, store);
      const score = entry.usage + superEffectiveTargets * 12 - resists * 5;
      const severity = score >= 45 ? 'high' : score >= 25 ? 'medium' : 'low';
      const reasons = [
        `${entry.usage.toFixed(1)}% usage in ${snapshot.label}`,
        `${superEffectiveTargets} team member(s) hit super effectively by common moves`,
        `${resists} team member(s) resist the known common attacks`,
      ];

      return {
        species: entry.species,
        rank: entry.rank,
        usage: entry.usage,
        score,
        severity,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
```

- [ ] **Step 4: Run threat tests**

Run:

```bash
npm run test -- src/domain/metaThreats.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit threat ranking**

```bash
git add src/domain/metaThreats.ts src/domain/metaThreats.test.ts
git commit -m "feat: rank meta threats"
```

## Task 7: Analysis Composition and Snapshot Refresh

**Files:**
- Create: `src/domain/analysis.ts`
- Create: `src/domain/analysis.test.ts`
- Create: `src/domain/snapshotRefresh.ts`
- Create: `src/domain/snapshotRefresh.test.ts`

- [ ] **Step 1: Write failing analysis tests**

Write `src/domain/analysis.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { analyzeTeam } from './analysis';
import { createDataStore } from './dataStore';
import { demoDataBundle } from '../data/demoSnapshots';

describe('analyzeTeam', () => {
  it('returns audit, threats, parse errors, and snapshot metadata', () => {
    const result = analyzeTeam({
      paste: `
Garchomp @ Rocky Helmet
Ability: Rough Skin
- Earthquake
- Stealth Rock

Dragonite @ Heavy-Duty Boots
Ability: Multiscale
- Dragon Dance
- Extreme Speed
`,
      format: 'champions-ou',
      store: createDataStore(demoDataBundle),
    });

    expect(result.team.members).toHaveLength(2);
    expect(result.audit.defensive.length).toBeGreaterThan(0);
    expect(result.threats.length).toBeGreaterThan(0);
    expect(result.snapshotStatus.label).toContain('Demo');
  });
});
```

Write `src/domain/snapshotRefresh.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { refreshSnapshots } from './snapshotRefresh';

describe('refreshSnapshots', () => {
  it('returns an explicit error when a configured source fails', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('network blocked'));
    const result = await refreshSnapshots({ fetcher: fetcher as unknown as typeof fetch });

    expect(result.ok).toBe(false);
    expect(result.message).toContain('network blocked');
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm run test -- src/domain/analysis.test.ts src/domain/snapshotRefresh.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement analysis composition**

Write `src/domain/analysis.ts`:

```ts
import { auditTeam } from './auditEngine';
import type { DataStore } from './dataStore';
import { rankMetaThreats } from './metaThreats';
import { parseShowdownTeam } from './teamImport';
import type { FormatId } from './types';

export function analyzeTeam({
  paste,
  format,
  store,
}: {
  paste: string;
  format: FormatId;
  store: DataStore;
}) {
  const team = parseShowdownTeam(paste);
  const metaSnapshot = store.getMetaSnapshot(format);

  return {
    team,
    audit: auditTeam({ team: team.members, store, format }),
    threats: rankMetaThreats({ team: team.members, store, format, limit: 10 }),
    snapshotStatus: metaSnapshot
      ? {
          label: `${metaSnapshot.isDemo ? 'Demo' : 'Live'} snapshot: ${metaSnapshot.label}`,
          source: metaSnapshot.source,
          date: metaSnapshot.date,
          isDemo: metaSnapshot.isDemo,
        }
      : {
          label: 'No usage snapshot for this format',
          source: 'none',
          date: 'unknown',
          isDemo: false,
        },
  };
}
```

- [ ] **Step 4: Implement refresh adapter result**

Write `src/domain/snapshotRefresh.ts`:

```ts
export type RefreshResult =
  | { ok: true; message: string; importedAt: string }
  | { ok: false; message: string };

export async function refreshSnapshots({
  fetcher = fetch,
}: {
  fetcher?: typeof fetch;
} = {}): Promise<RefreshResult> {
  try {
    const response = await fetcher('https://play.pokemonshowdown.com/data/pokedex.json');
    if (!response.ok) {
      return { ok: false, message: `Pokemon Showdown reference refresh failed with HTTP ${response.status}` };
    }

    await response.json();

    return {
      ok: true,
      message: 'Reference source reachable. Local snapshot kept for this V1 session.',
      importedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      message: `Snapshot refresh failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
```

- [ ] **Step 5: Run analysis and refresh tests**

Run:

```bash
npm run test -- src/domain/analysis.test.ts src/domain/snapshotRefresh.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit analysis composition**

```bash
git add src/domain/analysis.ts src/domain/analysis.test.ts src/domain/snapshotRefresh.ts src/domain/snapshotRefresh.test.ts
git commit -m "feat: compose team analysis"
```

## Task 8: React Dashboard UI

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Create: `src/App.test.tsx`
- Create: `src/components/FormatSelector.tsx`
- Create: `src/components/SnapshotStatus.tsx`
- Create: `src/components/TeamInput.tsx`
- Create: `src/components/TeamPreview.tsx`
- Create: `src/components/AuditPanel.tsx`
- Create: `src/components/ThreatPanel.tsx`

- [ ] **Step 1: Write failing UI tests**

Write `src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the V1 dashboard regions', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /strategy companion/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/format/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/showdown paste/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /team audit/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /meta threats/i })).toBeInTheDocument();
  });

  it('parses a pasted team and displays threats', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.clear(screen.getByLabelText(/showdown paste/i));
    await user.type(
      screen.getByLabelText(/showdown paste/i),
      `Garchomp @ Rocky Helmet{enter}Ability: Rough Skin{enter}- Earthquake{enter}- Stealth Rock`,
    );

    expect(await screen.findByText('Garchomp')).toBeInTheDocument();
    expect(screen.getByText(/Great Tusk|Kingambit|Corviknight/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run UI tests to verify failure**

Run:

```bash
npm run test -- src/App.test.tsx
```

Expected: FAIL because components are not implemented.

- [ ] **Step 3: Create presentational components**

Write `src/components/FormatSelector.tsx`:

```tsx
import { SUPPORTED_FORMATS } from '../domain/formatRules';
import type { FormatId } from '../domain/types';

export function FormatSelector({
  value,
  onChange,
}: {
  value: FormatId;
  onChange: (format: FormatId) => void;
}) {
  return (
    <label className="field">
      <span>Format</span>
      <select value={value} onChange={(event) => onChange(event.target.value as FormatId)}>
        {SUPPORTED_FORMATS.map((format) => (
          <option key={format.id} value={format.id}>
            {format.label}
          </option>
        ))}
      </select>
    </label>
  );
}
```

Write `src/components/SnapshotStatus.tsx`:

```tsx
export function SnapshotStatus({
  label,
  source,
  onRefresh,
  refreshMessage,
}: {
  label: string;
  source: string;
  onRefresh: () => void;
  refreshMessage?: string;
}) {
  return (
    <section className="snapshot-status" aria-label="Snapshot status">
      <div>
        <strong>{label}</strong>
        <span>{source}</span>
      </div>
      <button type="button" onClick={onRefresh}>
        Update
      </button>
      {refreshMessage ? <p>{refreshMessage}</p> : null}
    </section>
  );
}
```

Write `src/components/TeamInput.tsx`:

```tsx
export function TeamInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="field team-input">
      <span>Showdown paste</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
```

Write `src/components/TeamPreview.tsx`:

```tsx
import type { ParsedTeam } from '../domain/types';

export function TeamPreview({ team }: { team: ParsedTeam }) {
  return (
    <section className="panel">
      <h2>Team</h2>
      {team.errors.map((error) => (
        <p className="warning" key={error}>
          {error}
        </p>
      ))}
      <div className="team-grid">
        {team.members.map((member) => (
          <article className="team-card" key={`${member.slot}-${member.species}`}>
            <strong>{member.species}</strong>
            <span>{member.item ?? 'No item'}</span>
            <small>{member.moves.join(' / ')}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
```

Write `src/components/AuditPanel.tsx`:

```tsx
import type { TeamAudit } from '../domain/auditEngine';

export function AuditPanel({ audit }: { audit: TeamAudit }) {
  return (
    <section className="panel">
      <h2>Team audit</h2>
      {audit.dataWarnings.map((warning) => (
        <p className="warning" key={warning}>
          {warning}
        </p>
      ))}
      <div className="finding-list">
        {[...audit.defensive, ...audit.offensive].map((finding) => (
          <article className={`finding ${finding.severity}`} key={finding.title}>
            <strong>{finding.title}</strong>
            {finding.evidence.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </article>
        ))}
      </div>
      <h3>Roles</h3>
      <p>Detected: {audit.roles.detected.map((role) => `${role.role} (${role.member})`).join(', ') || 'none'}</p>
      <p>Missing: {audit.roles.missing.join(', ') || 'none'}</p>
      <h3>Speed tiers</h3>
      {audit.speed.map((speed) => (
        <p key={speed.species}>
          {speed.species}: {speed.speed} {speed.estimated ? '(estimated)' : ''}
        </p>
      ))}
    </section>
  );
}
```

Write `src/components/ThreatPanel.tsx`:

```tsx
import type { RankedThreat } from '../domain/metaThreats';

export function ThreatPanel({ threats }: { threats: RankedThreat[] }) {
  return (
    <section className="panel">
      <h2>Meta threats</h2>
      {threats.length === 0 ? <p>No usage snapshot available for this format.</p> : null}
      <div className="threat-list">
        {threats.map((threat) => (
          <article className={`threat ${threat.severity}`} key={threat.species}>
            <strong>
              #{threat.rank} {threat.species}
            </strong>
            <span>Score {threat.score.toFixed(1)}</span>
            {threat.reasons.map((reason) => (
              <small key={reason}>{reason}</small>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Wire the dashboard**

Replace `src/App.tsx`:

```tsx
import { useMemo, useState } from 'react';
import { AuditPanel } from './components/AuditPanel';
import { FormatSelector } from './components/FormatSelector';
import { SnapshotStatus } from './components/SnapshotStatus';
import { TeamInput } from './components/TeamInput';
import { TeamPreview } from './components/TeamPreview';
import { ThreatPanel } from './components/ThreatPanel';
import { demoDataBundle } from './data/demoSnapshots';
import { analyzeTeam } from './domain/analysis';
import { createDataStore } from './domain/dataStore';
import { refreshSnapshots } from './domain/snapshotRefresh';
import type { FormatId } from './domain/types';

const initialPaste = `Great Tusk @ Booster Energy
Ability: Protosynthesis
Tera Type: Ground
EVs: 252 Atk / 4 SpD / 252 Spe
Jolly Nature
- Earthquake
- Close Combat
- Stealth Rock
- Ice Beam`;

const store = createDataStore(demoDataBundle);

export default function App() {
  const [format, setFormat] = useState<FormatId>('champions-vgc');
  const [paste, setPaste] = useState(initialPaste);
  const [refreshMessage, setRefreshMessage] = useState<string>();

  const analysis = useMemo(() => analyzeTeam({ paste, format, store }), [paste, format]);

  async function handleRefresh() {
    const result = await refreshSnapshots();
    setRefreshMessage(result.message);
  }

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div>
          <h1>Pokemon Champions Strategy Companion</h1>
          <p>Local team audit and meta threat companion.</p>
        </div>
        <FormatSelector value={format} onChange={setFormat} />
        <SnapshotStatus
          label={analysis.snapshotStatus.label}
          source={analysis.snapshotStatus.source}
          onRefresh={handleRefresh}
          refreshMessage={refreshMessage}
        />
      </header>

      <div className="dashboard">
        <aside className="left-column">
          <TeamInput value={paste} onChange={setPaste} />
          <TeamPreview team={analysis.team} />
        </aside>
        <AuditPanel audit={analysis.audit} />
        <ThreatPanel threats={analysis.threats} />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Replace CSS with dashboard styling**

Replace `src/styles.css`:

```css
:root {
  color: #102033;
  background: #f5f7fb;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

button,
select {
  border: 1px solid #c9d4e5;
  border-radius: 6px;
  background: #ffffff;
  color: #102033;
  min-height: 38px;
  padding: 8px 10px;
}

button {
  cursor: pointer;
}

.app-shell {
  min-height: 100vh;
  padding: 20px;
}

.top-bar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 220px minmax(260px, 380px);
  gap: 16px;
  align-items: end;
  margin-bottom: 18px;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 4px;
  font-size: 26px;
}

h2 {
  font-size: 18px;
}

h3 {
  font-size: 14px;
  margin-bottom: 6px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span,
.snapshot-status span,
.team-card span,
small {
  color: #5d6b7f;
}

.snapshot-status,
.panel,
.team-input textarea {
  border: 1px solid #d9e1ed;
  border-radius: 8px;
  background: #ffffff;
}

.snapshot-status {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
}

.snapshot-status p {
  grid-column: 1 / -1;
  margin: 0;
  color: #8a4b10;
}

.dashboard {
  display: grid;
  grid-template-columns: minmax(280px, 0.95fr) minmax(360px, 1.35fr) minmax(280px, 1fr);
  gap: 16px;
  align-items: start;
}

.left-column {
  display: grid;
  gap: 16px;
}

.team-input textarea {
  min-height: 260px;
  resize: vertical;
  padding: 12px;
}

.panel {
  padding: 14px;
}

.team-grid,
.finding-list,
.threat-list {
  display: grid;
  gap: 10px;
}

.team-card,
.finding,
.threat {
  display: grid;
  gap: 5px;
  border: 1px solid #d9e1ed;
  border-radius: 6px;
  padding: 10px;
  background: #fbfcff;
}

.finding.high,
.threat.high {
  border-color: #ef9a9a;
  background: #fff1f1;
}

.finding.medium,
.threat.medium {
  border-color: #f4c274;
  background: #fff8e8;
}

.finding.low,
.threat.low {
  border-color: #b8d8c2;
  background: #f1fbf4;
}

.warning {
  border-radius: 6px;
  background: #fff3cd;
  color: #684800;
  padding: 8px;
}

@media (max-width: 1100px) {
  .top-bar,
  .dashboard {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: Run UI tests and build**

Run:

```bash
npm run test -- src/App.test.tsx
npm run build
```

Expected: PASS and build succeeds.

- [ ] **Step 7: Commit dashboard UI**

```bash
git add src/App.tsx src/App.test.tsx src/styles.css src/components
git commit -m "feat: build analysis dashboard"
```

## Task 9: Final Verification and README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Write `README.md`:

```md
# Pokemon Champions Strategy Companion

Local web companion for Pokemon Champions team auditing.

## V1 Features

- Import a Pokemon Showdown paste.
- Choose Champions VGC, Champions BSS, or Champions OU.
- Review defensive and offensive team audit findings.
- See simple role detection and speed estimates.
- Rank demo meta threats from the selected format snapshot.
- Attempt a reference snapshot refresh and display explicit refresh results.

## Development

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Run tests:

```bash
npm run test
```

Build:

```bash
npm run build
```

## Data Notes

The first version ships with typed demo snapshots so the app works offline and the analysis pipeline is testable. The update button checks a public Pokemon Showdown reference endpoint and reports success or failure clearly; it does not replace the local snapshot during this V1 session.
```

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run test
npm run build
```

Expected: all tests pass and build succeeds.

- [ ] **Step 3: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 4: Smoke test in browser**

Open the Vite URL and verify:

- the dashboard renders without blank panels;
- format switching changes the meta threat list;
- pasting a valid Showdown team updates the team cards;
- malformed paste blocks produce a visible warning;
- clicking `Update` shows a refresh success or failure message;
- mobile-width layout stacks into one column.

- [ ] **Step 5: Commit README and final verification**

```bash
git add README.md
git commit -m "docs: add local development notes"
```

- [ ] **Step 6: Record final status**

Run:

```bash
git status --short
git log --oneline --decorate -5
```

Expected: no uncommitted implementation files except intentionally untracked local context files such as `AGENTS.md`.

## Spec Coverage Review

- Local React/Vite app: Task 1.
- Format selector for Champions VGC/BSS/OU: Tasks 2 and 8.
- Showdown import: Task 3.
- Manual editing foundation: Task 8 uses the Showdown paste textarea as the canonical editable set source; edits reparse and recalculate immediately.
- Local snapshot metadata: Tasks 2, 7, and 8.
- Snapshot update flow: Task 7 and Task 8.
- Team audit engine: Tasks 4 and 5.
- Meta threat ranking: Task 6.
- Missing/demo data states: Tasks 7 and 8.
- Tests for parser, type calculations, audit, threats, format isolation, and UI states: Tasks 2 through 8.
