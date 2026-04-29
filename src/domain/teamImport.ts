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

const METADATA_LINE_PATTERN =
  /^(Ability|Level|Tera Type|EVs|IVs|Shiny|Gender|Happiness|Tera Blast Type|Dynamax Level|Gigantamax):/i;

function parseHeader(header: string) {
  const [namePart, itemPart] = header.split('@').map((part) => part.trim());
  const nameWithoutGender = namePart.replace(/\s+\((M|F|N)\)$/i, '').trim();
  const nicknameMatch = nameWithoutGender.match(/^(.+)\s+\((.+)\)$/);

  return {
    nickname: nicknameMatch ? nicknameMatch[1].trim() : undefined,
    species: nicknameMatch ? nicknameMatch[2].trim() : nameWithoutGender,
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

function isMetadataLine(line: string): boolean {
  return METADATA_LINE_PATTERN.test(line) || /^[A-Za-z]+ Nature$/i.test(line) || line.startsWith('-');
}

function parseBlock(block: string, slot: number): TeamMember | string {
  const lines = block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return `Block ${slot} is empty.`;
  }

  if (isMetadataLine(lines[0])) {
    return `Block ${slot} could not be parsed as a Pokemon set.`;
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
      const level = Number(line.replace(/^Level:\s*/i, '').trim());
      if (Number.isFinite(level)) {
        member.level = level;
      } else {
        member.parseWarnings.push(`Invalid Level in line: ${line}`);
      }
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
