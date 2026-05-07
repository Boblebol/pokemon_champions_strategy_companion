import type { LocaleId, LocalizedNames } from './types';

export const DEFAULT_LOCALE: LocaleId = 'fr';

export function toSearchId(value: string | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function localizedName(
  canonicalName: string,
  names: LocalizedNames | undefined,
  locale: LocaleId = DEFAULT_LOCALE,
): string {
  return names?.[locale] || names?.en || canonicalName;
}

export function displayLocalizedName(
  canonicalName: string,
  names: LocalizedNames | undefined,
  locale: LocaleId = DEFAULT_LOCALE,
): string {
  return localizedName(canonicalName, names, locale);
}

export function formatLocalizedName(
  canonicalName: string,
  names: LocalizedNames | undefined,
  locale: LocaleId = DEFAULT_LOCALE,
): string {
  const displayName = localizedName(canonicalName, names, locale);
  return toSearchId(displayName) === toSearchId(canonicalName) ? canonicalName : `${displayName} (${canonicalName})`;
}

export function localizedSearchText(
  canonicalName: string,
  names: LocalizedNames | undefined,
  locale: LocaleId = DEFAULT_LOCALE,
): string {
  const activeName = localizedName(canonicalName, names, locale);
  const values = [activeName, canonicalName, names?.fr, names?.en, names?.ja].filter(Boolean);
  return Array.from(new Set(values)).join(' ');
}

export function localizedLabelMap(
  labels: Record<string, LocalizedNames> | undefined,
  canonicalName: string,
): LocalizedNames | undefined {
  return labels?.[toSearchId(canonicalName)] ?? labels?.[canonicalName];
}
