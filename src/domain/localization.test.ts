import { describe, expect, it } from 'vitest';
import { displayLocalizedName, formatLocalizedName, localizedSearchText, toSearchId } from './localization';

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

  it('displays one active locale without appending the canonical name', () => {
    const names = { en: 'Great Tusk', fr: 'Fort-Ivoire' };

    expect(displayLocalizedName('Great Tusk', names, 'fr')).toBe('Fort-Ivoire');
    expect(displayLocalizedName('Great Tusk', names, 'en')).toBe('Great Tusk');
  });

  it('keeps canonical names searchable even when one locale is displayed', () => {
    const names = { en: 'Heavy-Duty Boots', fr: 'Grosses Bottes' };

    expect(localizedSearchText('Heavy-Duty Boots', names, 'fr')).toBe('Grosses Bottes Heavy-Duty Boots');
    expect(localizedSearchText('Heavy-Duty Boots', names, 'en')).toBe('Heavy-Duty Boots Grosses Bottes');
  });
});
