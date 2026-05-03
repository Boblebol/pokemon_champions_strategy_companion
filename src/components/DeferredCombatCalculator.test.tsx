import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import type { TeamMember } from '../domain/types';
import { DeferredCombatCalculator } from './DeferredCombatCalculator';

const selectedTeam: TeamMember[] = [
  {
    slot: 1,
    species: 'Great Tusk',
    item: 'Booster Energy',
    ability: 'Protosynthesis',
    evs: { atk: 252, spd: 4, spe: 252 },
    moves: ['Earthquake', 'Close Combat'],
    parseWarnings: [],
  },
];

describe('DeferredCombatCalculator', () => {
  it('eventually renders the combat calculator from a deferred module', async () => {
    render(
      <DeferredCombatCalculator
        format="champions-bss"
        selectedTeam={selectedTeam}
        reference={demoDataBundle.reference}
      />,
    );

    expect(await screen.findByRole('heading', { name: /^combat$/i })).toBeInTheDocument();
  });
});
