import { getFormatDefinition } from './formatRules';
import type { FormatId, TeamMember } from './types';

export function getPickSize(format: FormatId): number {
  const definition = getFormatDefinition(format);
  return definition?.pickSize ?? definition?.teamSize ?? 6;
}

export function selectMembersForMatch(
  members: TeamMember[],
  selectedSlots: number[] | undefined,
  format: FormatId,
): TeamMember[] {
  if (!selectedSlots) {
    return members;
  }

  const membersBySlot = new Map(members.map((member) => [member.slot, member]));
  return selectedSlots
    .slice(0, getPickSize(format))
    .flatMap((slotId) => {
      const member = membersBySlot.get(slotId);
      return member ? [member] : [];
    })
    .map((member, index) => ({ ...member, slot: index + 1 }));
}

export function selectionWarnings({
  selectedCount,
  pickSize,
}: {
  selectedCount: number;
  pickSize: number;
}): string[] {
  if (selectedCount < pickSize) {
    return [`Sélection incomplète : choisis ${pickSize} Pokémon pour ce format.`];
  }

  return [];
}
