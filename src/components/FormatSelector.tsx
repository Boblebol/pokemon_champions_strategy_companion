import { SUPPORTED_FORMATS } from '../domain/formatRules';
import type { FormatId } from '../domain/types';

export function FormatSelector({
  value,
  onChange,
  label = 'Format Champions',
}: {
  value: FormatId;
  onChange: (format: FormatId) => void;
  label?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as FormatId)}>
        {SUPPORTED_FORMATS.map((format) => (
          <option key={format.id} value={format.id}>
            {format.label}
          </option>
        ))}
      </select>
    </label>
  );
}
