import { auditTeam } from './auditEngine';
import type { TeamAudit } from './auditEngine';
import type { DataStore } from './dataStore';
import { rankMetaThreats } from './metaThreats';
import type { RankedThreat } from './metaThreats';
import { parseShowdownTeam } from './teamImport';
import type { FormatId, ParsedTeam } from './types';

export interface SnapshotStatus {
  label: string;
  source: string;
  date: string;
  isDemo: boolean;
}

export interface AnalysisResult {
  team: ParsedTeam;
  audit: TeamAudit;
  threats: RankedThreat[];
  snapshotStatus: SnapshotStatus;
}

export function analyzeTeam({
  paste,
  format,
  store,
}: {
  paste: string;
  format: FormatId;
  store: DataStore;
}): AnalysisResult {
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
