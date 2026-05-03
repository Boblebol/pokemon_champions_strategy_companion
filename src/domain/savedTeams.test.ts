import { describe, expect, it } from 'vitest';
import {
  SAVED_TEAMS_STORAGE_KEY,
  deleteSavedTeam,
  readSavedTeams,
  saveCurrentTeam,
} from './savedTeams';
import type { FormatId } from './types';

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe('savedTeams', () => {
  it('saves the current team in local storage with stable metadata', () => {
    const storage = new MemoryStorage();

    const saved = saveCurrentTeam({
      storage,
      name: 'Ladder BO1',
      paste: 'Great Tusk @ Booster Energy',
      format: 'champions-bss',
      now: () => '2026-05-03T12:00:00.000Z',
      createId: () => 'team-1',
    });

    expect(saved).toEqual({
      id: 'team-1',
      name: 'Ladder BO1',
      paste: 'Great Tusk @ Booster Energy',
      format: 'champions-bss' satisfies FormatId,
      createdAt: '2026-05-03T12:00:00.000Z',
      updatedAt: '2026-05-03T12:00:00.000Z',
    });
    expect(readSavedTeams(storage)).toEqual([saved]);
  });

  it('keeps only valid saved teams when storage contains stale data', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      SAVED_TEAMS_STORAGE_KEY,
      JSON.stringify([
        {
          id: 'valid',
          name: 'Balance',
          paste: 'Dragonite @ Heavy-Duty Boots',
          format: 'champions-bss',
          createdAt: '2026-05-03T12:00:00.000Z',
          updatedAt: '2026-05-03T12:00:00.000Z',
        },
        {
          id: 'invalid',
          name: '',
          paste: '',
          format: 'unknown',
        },
      ]),
    );

    expect(readSavedTeams(storage)).toHaveLength(1);
    expect(readSavedTeams(storage)[0].name).toBe('Balance');
  });

  it('deletes one saved team and persists the remaining list', () => {
    const storage = new MemoryStorage();
    const first = saveCurrentTeam({
      storage,
      name: 'Premier plan',
      paste: 'Great Tusk @ Booster Energy',
      format: 'champions-bss',
      now: () => '2026-05-03T12:00:00.000Z',
      createId: () => 'team-1',
    });
    const second = saveCurrentTeam({
      storage,
      name: 'Second plan',
      paste: 'Dragonite @ Heavy-Duty Boots',
      format: 'champions-vgc',
      now: () => '2026-05-03T12:01:00.000Z',
      createId: () => 'team-2',
    });

    expect(deleteSavedTeam(storage, first.id)).toEqual([second]);
    expect(readSavedTeams(storage)).toEqual([second]);
  });
});
