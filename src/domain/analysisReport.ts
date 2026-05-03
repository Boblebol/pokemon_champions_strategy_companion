import type { AnalysisResult } from './analysis';
import { getFormatDefinition } from './formatRules';
import { META_THREAT_SCORE_EXPLANATION } from './metaThreats';
import { POSSIBLE_THREAT_SCORE_EXPLANATION } from './possibleThreats';
import { moveDisplayName, pokemonDisplayName } from './referenceDisplay';
import type { FormatId, ReferenceSnapshot, TeamMember } from './types';

function lineList(lines: string[]): string {
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join('\n') : '- Rien a signaler.';
}

function formatMember(reference: ReferenceSnapshot, member: TeamMember): string {
  const item = member.item ? ` @ ${member.item}` : '';
  const moves = member.moves.map((move) => moveDisplayName(reference, move)).join(' / ') || 'aucune attaque renseignee';
  return `- ${pokemonDisplayName(reference, member.species)}${item} : ${moves}`;
}

export function buildAnalysisReport({
  analysis,
  reference,
  format,
}: {
  analysis: AnalysisResult;
  reference: ReferenceSnapshot;
  format: FormatId;
}): string {
  const formatLabel = getFormatDefinition(format)?.label ?? format;
  const frequentThreats = analysis.threats.slice(0, 5).map((threat) => {
    return `- ${pokemonDisplayName(reference, threat.species)} : Score ${threat.score.toFixed(1)} (${threat.reasons.join(' ; ')})`;
  });
  const rareThreats = analysis.selectedPossibleThreats.slice(0, 5).map((threat) => {
    const coverage = threat.coverageMoves
      .map((move) => `${moveDisplayName(reference, move.move)} -> ${move.targets.join(', ')}`)
      .join(' ; ');

    return `- ${pokemonDisplayName(reference, threat.species)} : Score ${threat.score.toFixed(1)}${coverage ? ` (${coverage})` : ''}`;
  });
  const selectedNames =
    analysis.selectedTeam.members.map((member) => pokemonDisplayName(reference, member.species)).join(', ') ||
    'aucune selection';

  return [
    '# Rapport Champions Companion',
    '',
    `Format : ${formatLabel}`,
    `Selection jouee : ${selectedNames}`,
    `Snapshot : ${analysis.snapshotStatus.label}`,
    '',
    '## Equipe',
    lineList(analysis.team.members.map((member) => formatMember(reference, member))),
    '',
    '## Audit selection',
    lineList([
      ...analysis.selectionWarnings,
      ...analysis.selectedAudit.defensive.map((finding) => `${finding.title} - ${finding.evidence.join(' ; ')}`),
      ...analysis.selectedAudit.offensive.map((finding) => `${finding.title} - ${finding.evidence.join(' ; ')}`),
    ]),
    '',
    '## Menaces frequentes',
    META_THREAT_SCORE_EXPLANATION,
    lineList(frequentThreats),
    '',
    '## Menaces rares',
    POSSIBLE_THREAT_SCORE_EXPLANATION,
    lineList(rareThreats),
    '',
    '## Statut des donnees',
    lineList([analysis.snapshotStatus.source, `Date : ${analysis.snapshotStatus.date}`]),
    '',
  ].join('\n');
}

export function reportDownloadHref(report: string): string {
  return `data:text/markdown;charset=utf-8,${encodeURIComponent(report)}`;
}
