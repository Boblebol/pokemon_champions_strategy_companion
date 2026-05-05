import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import type { TeamMember } from '../domain/types';
import { DeferredCombatCalculator } from './DeferredCombatCalculator';

const selectedTeam: TeamMember[] = [
  {
    slot: 1,
    species: 'Dragonite',
    item: 'Heavy-Duty Boots',
    ability: 'Multiscale',
    evs: { atk: 252, spd: 4, spe: 252 },
    moves: ['Earthquake', 'Extreme Speed'],
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
        locale="fr"
      />,
    );

    expect(await screen.findByRole('heading', { name: /^combat$/i })).toBeInTheDocument();
  });

  it('shows searchable friendly active pickers based on the battle style', async () => {
    render(
      <DeferredCombatCalculator
        format="champions-vgc"
        selectedTeam={[
          ...selectedTeam,
          {
            slot: 2,
            species: 'Garchomp',
            evs: {},
            moves: ['Earthquake'],
            parseWarnings: [],
          },
        ]}
        reference={demoDataBundle.reference}
        locale="fr"
      />,
    );

    expect(await screen.findByLabelText(/allié actif 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/allié actif 2/i)).toBeInTheDocument();
  });
});
