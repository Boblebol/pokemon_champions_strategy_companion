import { useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export interface PickerOption {
  value: string;
  label: string;
  searchText: string;
  description?: string;
  media: ReactNode;
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function compactSearch(value: string): string {
  return normalizeSearch(value).replace(/\s/g, '');
}

export function SearchablePicker({
  label,
  value,
  placeholder,
  options,
  emptyLabel = 'Aucun résultat',
  onChange,
}: {
  label: string;
  value: string | undefined;
  placeholder: string;
  options: PickerOption[];
  emptyLabel?: string;
  onChange: (value: string | undefined) => void;
}) {
  const inputId = useId();
  const resultsId = useId();
  const helpId = useId();
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const normalizedQuery = normalizeSearch(query.trim());
  const compactQuery = compactSearch(query.trim());
  const visibleOptions = useMemo(() => {
    const sorted = [...options].sort((left, right) => left.label.localeCompare(right.label, 'fr'));
    if (!normalizedQuery) {
      return sorted.slice(0, 24);
    }

    return sorted
      .filter((option) => {
        const haystack = `${option.label} ${option.searchText}`;
        return normalizeSearch(haystack).includes(normalizedQuery) || compactSearch(haystack).includes(compactQuery);
      })
      .slice(0, 24);
  }, [compactQuery, normalizedQuery, options]);

  return (
    <div className="field searchable-picker">
      <label className="searchable-picker-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="picker-current">
        {selected?.media}
        <div>
          <strong>{selected?.label ?? 'Aucun choix'}</strong>
          {selected?.description ? <small>{selected.description}</small> : null}
        </div>
      </div>
      <input
        id={inputId}
        aria-autocomplete="list"
        aria-controls={resultsId}
        aria-describedby={helpId}
        aria-expanded="true"
        role="combobox"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
      />
      {value ? (
        <button
          type="button"
          className="picker-clear"
          onClick={() => {
            onChange(undefined);
            setQuery('');
          }}
        >
          Effacer
        </button>
      ) : null}
      <small className="picker-help" id={helpId} aria-live="polite">
        {normalizedQuery ? `${visibleOptions.length} résultat(s)` : 'Tape quelques lettres pour filtrer la liste.'}
      </small>
      <div className="picker-results" id={resultsId} role="listbox" aria-label="Résultats de recherche">
        {visibleOptions.length === 0 ? <p>{emptyLabel}</p> : null}
        {visibleOptions.map((option) => (
          <button
            type="button"
            key={option.value}
            aria-selected={option.value === value}
            className={option.value === value ? 'active' : ''}
            role="option"
            onClick={() => {
              onChange(option.value);
              setQuery('');
            }}
          >
            {option.media}
            <span>
              <strong>{option.label}</strong>
              {option.description ? <small>{option.description}</small> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
