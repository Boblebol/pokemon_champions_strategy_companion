import type { FormatId } from './types';

export const SAVED_TEAMS_STORAGE_KEY = 'champions-companion.saved-teams';

export interface SavedTeam {
  id: string;
  name: string;
  paste: string;
  format: FormatId;
  createdAt: string;
  updatedAt: string;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const FORMAT_IDS: FormatId[] = ['champions-vgc', 'champions-bss', 'champions-ou'];

function isFormatId(value: unknown): value is FormatId {
  return typeof value === 'string' && FORMAT_IDS.includes(value as FormatId);
}

function isSavedTeam(value: unknown): value is SavedTeam {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<SavedTeam>;

  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.name === 'string' &&
    candidate.name.length > 0 &&
    typeof candidate.paste === 'string' &&
    candidate.paste.length > 0 &&
    isFormatId(candidate.format) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

function persistSavedTeams(storage: StorageLike, teams: SavedTeam[]) {
  storage.setItem(SAVED_TEAMS_STORAGE_KEY, JSON.stringify(teams));
}

function fallbackId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `team-${Date.now().toString(36)}`;
}

export function readSavedTeams(storage: StorageLike): SavedTeam[] {
  const rawValue = storage.getItem(SAVED_TEAMS_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter(isSavedTeam) : [];
  } catch {
    return [];
  }
}

export function saveCurrentTeam({
  storage,
  name,
  paste,
  format,
  now = () => new Date().toISOString(),
  createId = fallbackId,
}: {
  storage: StorageLike;
  name: string;
  paste: string;
  format: FormatId;
  now?: () => string;
  createId?: () => string;
}): SavedTeam {
  const timestamp = now();
  const savedTeam: SavedTeam = {
    id: createId(),
    name: name.trim() || 'Equipe sans nom',
    paste,
    format,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const existingTeams = readSavedTeams(storage);

  persistSavedTeams(storage, [savedTeam, ...existingTeams]);

  return savedTeam;
}

export function deleteSavedTeam(storage: StorageLike, id: string): SavedTeam[] {
  const nextTeams = readSavedTeams(storage).filter((team) => team.id !== id);
  persistSavedTeams(storage, nextTeams);
  return nextTeams;
}
