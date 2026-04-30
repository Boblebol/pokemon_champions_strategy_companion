import { describe, expect, it } from 'vitest';
import { formatLocalizedName, toSearchId } from './localization';

describe('localization', () => {
  it('normalizes accented names for search aliases', () => {
    expect(toSearchId('Épine-de-Fer')).toBe('epinedefer');
    expect(toSearchId('Fort-Ivoire')).toBe('fortivoire');
    expect(toSearchId('Téra Explosion')).toBe('teraexplosion');
  });

  it('formats localized names without changing canonical values', () => {
    expect(formatLocalizedName('Great Tusk', { en: 'Great Tusk', fr: 'Fort-Ivoire' }, 'fr')).toBe(
      'Fort-Ivoire (Great Tusk)',
    );
    expect(formatLocalizedName('Garchomp', { en: 'Garchomp', fr: 'Garchomp' }, 'fr')).toBe('Garchomp');
    expect(formatLocalizedName('Thunderbolt', undefined, 'fr')).toBe('Thunderbolt');
  });
});
