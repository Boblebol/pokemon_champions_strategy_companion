import { getFormatDefinition } from './formatRules';
import type { FormatId, MetaSnapshot, UsageEntry } from './types';

const SMOGON_USAGE_MONTH = '2026-03';
const SMOGON_CUTOFF = 1760;
const SMOGON_FORMAT_FILES: Record<FormatId, string> = {
  'champions-vgc': 'gen9vgc2026regf-1760.json',
  'champions-bss': 'gen9bssregi-1760.json',
  'champions-ou': 'gen9nationaldex-1760.json',
};

export type RefreshResult =
  | { ok: true; message: string; importedAt: string; snapshot: MetaSnapshot }
  | { ok: false; message: string };

export type SnapshotRefreshFetcher = (input: string) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

interface SmogonChaosPayload {
  info?: {
    metagame?: string;
    cutoff?: number;
    'number of battles'?: number;
  };
  data?: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function numberValue(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeUsage(rawUsage: number): number {
  return rawUsage > 1 ? rawUsage : rawUsage * 100;
}

function readCommonMoves(entry: Record<string, unknown>): string[] {
  const moves = entry.Moves;
  if (!isRecord(moves)) {
    return [];
  }

  return Object.entries(moves)
    .filter(([, usage]) => typeof usage === 'number' && Number.isFinite(usage))
    .sort(([, left], [, right]) => Number(right) - Number(left))
    .slice(0, 4)
    .map(([move]) => move);
}

function parseSmogonChaosSnapshot({
  payload,
  format,
  source,
  importedAt,
}: {
  payload: unknown;
  format: FormatId;
  source: string;
  importedAt: string;
}): MetaSnapshot {
  if (!isRecord(payload) || !isRecord((payload as SmogonChaosPayload).data)) {
    throw new Error('payload Smogon invalide');
  }
  const payloadRecord = payload as Record<string, unknown>;
  const info = isRecord(payloadRecord.info) ? payloadRecord.info : undefined;

  const formatDefinition = getFormatDefinition(format);
  if (!formatDefinition) {
    throw new Error(`Format non supporté : ${format}`);
  }

  const data = payloadRecord.data as Record<string, unknown>;
  const entries: UsageEntry[] = Object.entries(data)
    .flatMap(([species, rawEntry]) => {
      if (!isRecord(rawEntry)) {
        return [];
      }

      const usage = numberValue(rawEntry, 'usage');
      if (usage === undefined) {
        return [];
      }

      return [
        {
          rank: 0,
          species,
          usage: normalizeUsage(usage),
          commonMoves: readCommonMoves(rawEntry),
        },
      ];
    })
    .sort((left, right) => right.usage - left.usage || left.species.localeCompare(right.species))
    .slice(0, 20)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  if (entries.length === 0) {
    throw new Error('payload Smogon sans usage exploitable');
  }

  return {
    id: `smogon-${format}-${SMOGON_USAGE_MONTH}-${SMOGON_CUTOFF}`,
    format,
    label: `${formatDefinition.label} Smogon ${SMOGON_USAGE_MONTH}`,
    source,
    date: SMOGON_USAGE_MONTH,
    importedAt,
    battleCount: info ? numberValue(info, 'number of battles') : undefined,
    isDemo: false,
    entries,
  };
}

export async function refreshSnapshots({
  fetcher = fetch,
  format = 'champions-vgc',
  useProxy = false,
}: {
  fetcher?: SnapshotRefreshFetcher;
  format?: FormatId;
  useProxy?: boolean;
} = {}): Promise<RefreshResult> {
  const fileName = SMOGON_FORMAT_FILES[format];
  const statsPath = `/stats/${SMOGON_USAGE_MONTH}/chaos/${fileName}`;
  const source = `https://www.smogon.com${statsPath}`;
  const fetchUrl = useProxy ? `/smogon-stats${statsPath}` : source;
  const formatDefinition = getFormatDefinition(format);

  try {
    const response = await fetcher(fetchUrl);
    if (!response.ok) {
      return {
        ok: false,
        message: `Données Smogon indisponibles (HTTP ${response.status}). Snapshots locaux conservés.`,
      };
    }

    const importedAt = new Date().toISOString();
    const snapshot = parseSmogonChaosSnapshot({
      payload: await response.json(),
      format,
      source,
      importedAt,
    });

    return {
      ok: true,
      message: `Données Smogon ${SMOGON_USAGE_MONTH} importées pour ${formatDefinition?.label ?? format}.`,
      importedAt,
      snapshot,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Refresh Smogon impossible : ${error instanceof Error ? error.message : String(error)}. Snapshots locaux conservés.`,
    };
  }
}
