import type { FormatDefinition } from './types';

export const SUPPORTED_FORMATS: FormatDefinition[] = [
  {
    id: 'champions-vgc',
    label: 'Champions VGC',
    battleStyle: 'doubles',
    teamSize: 6,
    pickSize: 4,
    defaultLevel: 50,
  },
  {
    id: 'champions-bss',
    label: 'Champions 3v3',
    battleStyle: 'singles',
    teamSize: 6,
    pickSize: 3,
    defaultLevel: 100,
  },
  {
    id: 'champions-ou',
    label: 'Champions OU',
    battleStyle: 'six-vs-six',
    teamSize: 6,
    pickSize: 6,
    defaultLevel: 100,
  },
];

export function getFormatDefinition(formatId: FormatDefinition['id']) {
  return SUPPORTED_FORMATS.find((format) => format.id === formatId);
}
