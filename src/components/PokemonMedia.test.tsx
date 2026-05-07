import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PokemonAvatar } from './PokemonMedia';
import type { ReferenceSnapshot } from '../domain/types';

const reference = {
  id: 'test-reference',
  source: 'test',
  importedAt: '2026-05-06T00:00:00.000Z',
  locale: 'fr',
  pokemon: {
    dragonitemega: {
      id: 'dragonitemega',
      name: 'Dragonite-Mega',
      image: {
        sprite: '/missing-dragonite.png',
      },
      types: ['Dragon', 'Flying'],
      baseStats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
      abilities: [],
      moveIds: [],
    },
  },
  moves: {},
  items: [],
  itemDetails: {},
  natures: [],
  abilityDetails: {},
  natureDetails: {},
  labels: {
    abilities: {},
    items: {},
    natures: {},
    types: {
      Normal: { en: 'Normal', fr: 'Normal' },
      Fire: { en: 'Fire', fr: 'Feu' },
      Water: { en: 'Water', fr: 'Eau' },
      Electric: { en: 'Electric', fr: 'Electrik' },
      Grass: { en: 'Grass', fr: 'Plante' },
      Ice: { en: 'Ice', fr: 'Glace' },
      Fighting: { en: 'Fighting', fr: 'Combat' },
      Poison: { en: 'Poison', fr: 'Poison' },
      Ground: { en: 'Ground', fr: 'Sol' },
      Flying: { en: 'Flying', fr: 'Vol' },
      Psychic: { en: 'Psychic', fr: 'Psy' },
      Bug: { en: 'Bug', fr: 'Insecte' },
      Rock: { en: 'Rock', fr: 'Roche' },
      Ghost: { en: 'Ghost', fr: 'Spectre' },
      Dragon: { en: 'Dragon', fr: 'Dragon' },
      Dark: { en: 'Dark', fr: 'Tenebres' },
      Steel: { en: 'Steel', fr: 'Acier' },
      Fairy: { en: 'Fairy', fr: 'Fee' },
    },
  },
} satisfies ReferenceSnapshot;

describe('PokemonAvatar', () => {
  it('replaces a failed remote sprite with initials instead of leaving an empty tile', () => {
    const { container } = render(<PokemonAvatar reference={reference} species="Dragonite-Mega" />);

    const image = container.querySelector('img');
    expect(image).not.toBeNull();
    fireEvent.error(image as HTMLImageElement);

    expect(screen.getByText('DM')).toBeInTheDocument();
  });
});
