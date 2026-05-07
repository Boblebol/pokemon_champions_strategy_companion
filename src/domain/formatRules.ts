import type { FormatDefinition } from './types';

export const SUPPORTED_FORMATS: FormatDefinition[] = [
  {
    id: 'champions-vgc',
    label: '[Champions] VGC 2026 Reg M-A',
    showdownName: '[Gen 9 Champions] VGC 2026 Reg M-A',
    smogonSlug: 'gen9championsvgc2026regma',
    battleStyle: 'doubles',
    teamSize: 6,
    pickSize: 4,
    defaultLevel: 50,
  },
  {
    id: 'champions-bss',
    label: '[Champions] BSS Reg M-A',
    showdownName: '[Gen 9 Champions] BSS Reg M-A',
    smogonSlug: 'gen9championsbssregma',
    battleStyle: 'singles',
    teamSize: 6,
    pickSize: 3,
    defaultLevel: 50,
  },
  {
    id: 'champions-ou',
    label: '[Champions] OU',
    showdownName: '[Gen 9 Champions] OU',
    smogonSlug: 'gen9championsou',
    battleStyle: 'six-vs-six',
    teamSize: 6,
    pickSize: 6,
    defaultLevel: 100,
  },
];

export function getFormatDefinition(formatId: FormatDefinition['id']) {
  return SUPPORTED_FORMATS.find((format) => format.id === formatId);
}
