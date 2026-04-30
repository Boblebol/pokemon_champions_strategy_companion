import type { StatId, StatTable, TeamMember } from './types';

const TEAM_SIZE = 6;
const MOVE_SLOTS = 4;
const STAT_ORDER: StatId[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
const STAT_LABELS: Record<StatId, string> = {
  hp: 'HP',
  atk: 'Atk',
  def: 'Def',
  spa: 'SpA',
  spd: 'SpD',
  spe: 'Spe',
};

export interface BuilderSlot {
  id: number;
  species?: string;
  item?: string;
  ability?: string;
  nature?: string;
  evs: StatTable;
  moves: string[];
  comment: string;
}

export interface TeamBuilderState {
  slots: BuilderSlot[];
}

function emptyMoves(): string[] {
  return Array.from({ length: MOVE_SLOTS }, () => '');
}

function createEmptySlot(id: number): BuilderSlot {
  return {
    id,
    evs: {},
    moves: emptyMoves(),
    comment: '',
  };
}

function compactMoves(moves: string[]): string[] {
  return moves.map((move) => move.trim()).filter(Boolean).slice(0, MOVE_SLOTS);
}

function normalizeMoves(moves: string[] | undefined): string[] {
  return [...(moves ?? []), ...emptyMoves()].slice(0, MOVE_SLOTS);
}

function formatEvs(evs: StatTable): string | undefined {
  const parts = STAT_ORDER.flatMap((stat) => {
    const value = evs[stat];
    return typeof value === 'number' && value > 0 ? [`${value} ${STAT_LABELS[stat]}`] : [];
  });

  return parts.length > 0 ? parts.join(' / ') : undefined;
}

export function createEmptyBuilderState(slotCount = TEAM_SIZE): TeamBuilderState {
  return {
    slots: Array.from({ length: slotCount }, (_, index) => createEmptySlot(index + 1)),
  };
}

export function updateBuilderSlot(
  state: TeamBuilderState,
  slotId: number,
  patch: Partial<Omit<BuilderSlot, 'id'>>,
): TeamBuilderState {
  return {
    ...state,
    slots: state.slots.map((slot) => {
      if (slot.id !== slotId) {
        return slot;
      }

      return {
        ...slot,
        ...patch,
        evs: patch.evs ?? slot.evs,
        moves: patch.moves ? normalizeMoves(patch.moves) : slot.moves,
      };
    }),
  };
}

export function builderStateFromMembers(members: TeamMember[], slotCount = TEAM_SIZE): TeamBuilderState {
  const state = createEmptyBuilderState(slotCount);

  return members.slice(0, slotCount).reduce((currentState, member, index) => {
    return updateBuilderSlot(currentState, index + 1, {
      species: member.species,
      item: member.item,
      ability: member.ability,
      nature: member.nature,
      evs: member.evs,
      moves: member.moves,
    });
  }, state);
}

export function builderStateToMembers(state: TeamBuilderState): TeamMember[] {
  return state.slots.flatMap((slot) => {
    if (!slot.species?.trim()) {
      return [];
    }

    return [
      {
        slot: slot.id,
        species: slot.species.trim(),
        item: slot.item?.trim() || undefined,
        ability: slot.ability?.trim() || undefined,
        nature: slot.nature?.trim() || undefined,
        evs: slot.evs,
        moves: compactMoves(slot.moves),
        parseWarnings: [],
      },
    ];
  });
}

export function builderStateToShowdownPaste(state: TeamBuilderState): string {
  return state.slots
    .flatMap((slot) => {
      if (!slot.species?.trim()) {
        return [];
      }

      const lines = [`${slot.species.trim()}${slot.item?.trim() ? ` @ ${slot.item.trim()}` : ''}`];
      if (slot.ability?.trim()) {
        lines.push(`Ability: ${slot.ability.trim()}`);
      }

      const evLine = formatEvs(slot.evs);
      if (evLine) {
        lines.push(`EVs: ${evLine}`);
      }

      if (slot.nature?.trim()) {
        lines.push(`${slot.nature.trim()} Nature`);
      }

      for (const move of compactMoves(slot.moves)) {
        lines.push(`- ${move}`);
      }

      return [lines.join('\n')];
    })
    .join('\n\n');
}
