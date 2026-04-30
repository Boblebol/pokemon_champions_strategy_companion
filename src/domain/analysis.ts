import { auditTeam } from './auditEngine';
import type { TeamAudit } from './auditEngine';
import type { DataStore } from './dataStore';
import { getPickSize, selectMembersForMatch, selectionWarnings } from './matchSelection';
import { rankMetaThreats } from './metaThreats';
import type { RankedThreat } from './metaThreats';
import { rankPossibleThreats } from './possibleThreats';
import type { PossibleThreat } from './possibleThreats';
import { parseShowdownTeam } from './teamImport';
import type { FormatId, ParsedTeam, TeamMember } from './types';

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
  selectedTeam: ParsedTeam;
  selectedAudit: TeamAudit;
  selectedThreats: RankedThreat[];
  possibleThreats: PossibleThreat[];
  selectedPossibleThreats: PossibleThreat[];
  pickSize: number;
  selectionWarnings: string[];
  snapshotStatus: SnapshotStatus;
}

export function analyzeTeam({
  paste,
  format,
  store,
  teamMembers,
  selectedSlots,
}: {
  paste?: string;
  format: FormatId;
  store: DataStore;
  teamMembers?: TeamMember[];
  selectedSlots?: number[];
}): AnalysisResult {
  const team = teamMembers ? { members: teamMembers, errors: [] } : parseShowdownTeam(paste ?? '');
  const pickSize = getPickSize(format);
  const selectedMembers = selectMembersForMatch(team.members, selectedSlots, format);
  const selectedTeam = { members: selectedMembers, errors: [] };
  const metaSnapshot = store.getMetaSnapshot(format);
  const hasCompleteSelection = selectedMembers.length === pickSize;

  return {
    team,
    audit: auditTeam({ team: team.members, store, format }),
    threats: rankMetaThreats({ team: team.members, store, format, limit: 10 }),
    selectedTeam,
    selectedAudit: auditTeam({ team: selectedMembers, store, format }),
    selectedThreats: rankMetaThreats({ team: selectedMembers, store, format, limit: 10 }),
    possibleThreats: [],
    selectedPossibleThreats: hasCompleteSelection
      ? rankPossibleThreats({ team: selectedMembers, store, format, limit: 8 })
      : [],
    pickSize,
    selectionWarnings: selectedSlots ? selectionWarnings({ selectedCount: selectedMembers.length, pickSize }) : [],
    snapshotStatus: metaSnapshot
      ? {
          label: `Snapshot ${metaSnapshot.isDemo ? 'demo' : 'live'} : ${metaSnapshot.label}`,
          source: metaSnapshot.source,
          date: metaSnapshot.date,
          isDemo: metaSnapshot.isDemo,
        }
      : {
          label: "Aucun snapshot d'usage pour ce format",
          source: 'aucune',
          date: 'inconnue',
          isDemo: false,
        },
  };
}
