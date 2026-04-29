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
