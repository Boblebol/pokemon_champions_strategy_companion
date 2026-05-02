import { useId, useMemo, useRef, useState } from 'react';
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
  const pickerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div
      className="field searchable-picker"
      ref={pickerRef}
      onBlur={(event) => {
        if (!pickerRef.current?.contains(event.relatedTarget)) {
          setIsExpanded(false);
        }
      }}
    >
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
        aria-expanded={isExpanded}
        role="combobox"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsExpanded(true);
        }}
        onFocus={() => setIsExpanded(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setIsExpanded(false);
          }
        }}
        placeholder={placeholder}
      />
      {value ? (
        <button
          type="button"
          className="picker-clear"
          onClick={() => {
            onChange(undefined);
            setQuery('');
            setIsExpanded(false);
          }}
        >
          Effacer
        </button>
      ) : null}
      <small className="picker-help" id={helpId} aria-live="polite">
        {normalizedQuery ? `${visibleOptions.length} résultat(s)` : 'Tape quelques lettres pour filtrer la liste.'}
      </small>
      {isExpanded ? (
        <div className="picker-results" id={resultsId} role="listbox" aria-label="Résultats de recherche">
          {visibleOptions.length === 0 ? <p>{emptyLabel}</p> : null}
          {visibleOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              aria-selected={option.value === value}
              className={option.value === value ? 'active' : ''}
              role="option"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setQuery('');
                setIsExpanded(false);
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
      ) : null}
    </div>
  );
}
