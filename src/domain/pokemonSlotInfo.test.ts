import { describe, expect, it } from 'vitest';
import { demoDataBundle } from '../data/demoSnapshots';
import { toId } from './ids';
import {
  defaultAbilityForPokemon,
  defaultEvsForPokemon,
  evTotal,
  hydrateSlotForPokemon,
  moveOptionsForSlot,
  natureEffectLabel,
} from './pokemonSlotInfo';
import type { BuilderSlot } from './teamBuilder';

const reference = demoDataBundle.reference;

function slot(overrides: Partial<BuilderSlot>): BuilderSlot {
  return {
    id: 1,
    evs: {},
    moves: ['', '', '', ''],
    comment: '',
    ...overrides,
  };
}

describe('pokemonSlotInfo', () => {
  it('hydrates a selected Pokemon with battle defaults but leaves nature empty', () => {
    const dragonite = reference.pokemon[toId('Dragonite')];

    expect(hydrateSlotForPokemon(dragonite, reference.natures)).toMatchObject({
      species: 'Dragonite',
      ability: 'Multiscale',
      teraType: 'Dragon',
      nature: undefined,
      evs: { hp: 6, atk: 252, spe: 252 },
      moves: ['', '', '', ''],
    });
    expect(evTotal(defaultEvsForPokemon(dragonite))).toBe(510);
  });

  it('prefers the competitive mockup ability when the full reference lists utility abilities first', () => {
    const dragonite = {
      ...reference.pokemon[toId('Dragonite')],
      abilities: ['Inner Focus', 'Multiscale'],
    };
    const kangaskhan = {
      ...reference.pokemon[toId('Kangaskhan')],
      abilities: ['Early Bird', 'Inner Focus', 'Scrappy'],
    };

    expect(defaultAbilityForPokemon(dragonite)).toBe('Multiscale');
    expect(defaultAbilityForPokemon(kangaskhan)).toBe('Scrappy');
  });

  it('formats nature effects in the active locale before selection', () => {
    expect(natureEffectLabel('Jolly', 'fr')).toBe('+Vitesse / -Attaque Spéciale');
    expect(natureEffectLabel('Adamant', 'en')).toBe('+Attack / -Special Attack');
    expect(natureEffectLabel('Hardy', 'fr')).toBe('neutre');
  });

  it('keeps move choices inside the selected Pokemon movepool and prevents duplicates', () => {
    const dragonite = reference.pokemon[toId('Dragonite')];
    const garchomp = reference.pokemon[toId('Garchomp')];
    const moves = Object.values(reference.moves);
    const currentSlot = slot({
      species: 'Dragonite',
      moves: ['Extreme Speed', '', '', ''],
    });

    const secondMoveOptions = moveOptionsForSlot(currentSlot, dragonite, moves, 1).map((move) => move.name);

    expect(secondMoveOptions).toContain('Earthquake');
    expect(secondMoveOptions).not.toContain('Extreme Speed');
    expect(secondMoveOptions).not.toContain('Swords Dance');

    const garchompOptions = moveOptionsForSlot(slot({ species: 'Garchomp' }), garchomp, moves, 0).map(
      (move) => move.name,
    );

    expect(garchompOptions).toContain('Earthquake');
    expect(garchompOptions).not.toContain('Extreme Speed');
  });
});
