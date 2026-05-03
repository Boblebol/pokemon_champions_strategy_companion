import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = options.find((option) => option.value === value);
  const normalizedQuery = normalizeSearch(query.trim());
  const compactQuery = compactSearch(query.trim());
  const indexedOptions = useMemo(
    () =>
      options.map((option) => {
        const haystack = `${option.label} ${option.searchText}`;
        return {
          ...option,
          compactHaystack: compactSearch(haystack),
          normalizedHaystack: normalizeSearch(haystack),
        };
      }),
    [options],
  );
  const visibleOptions = useMemo(() => {
    const sorted = [...indexedOptions].sort((left, right) => left.label.localeCompare(right.label, 'fr'));
    if (!normalizedQuery) {
      return sorted.slice(0, 24);
    }

    return sorted
      .filter((option) => option.normalizedHaystack.includes(normalizedQuery) || option.compactHaystack.includes(compactQuery))
      .slice(0, 24);
  }, [compactQuery, indexedOptions, normalizedQuery]);

  useEffect(() => {
    setActiveIndex((currentIndex) => {
      if (!isExpanded || visibleOptions.length === 0) {
        return -1;
      }

      return currentIndex >= visibleOptions.length ? visibleOptions.length - 1 : currentIndex;
    });
  }, [isExpanded, visibleOptions.length]);

  function optionId(index: number): string {
    return `${resultsId}-option-${index}`;
  }

  function selectOption(option: PickerOption) {
    onChange(option.value);
    setQuery('');
    setIsExpanded(false);
    setActiveIndex(-1);
  }

  return (
    <div
      className="field searchable-picker"
      ref={pickerRef}
      onBlur={(event) => {
        if (!pickerRef.current?.contains(event.relatedTarget)) {
          setIsExpanded(false);
          setActiveIndex(-1);
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
        aria-activedescendant={isExpanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-controls={resultsId}
        aria-describedby={helpId}
        aria-expanded={isExpanded}
        role="combobox"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setIsExpanded(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsExpanded(true)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setIsExpanded(true);
            setActiveIndex((currentIndex) => {
              if (visibleOptions.length === 0) {
                return -1;
              }

              return currentIndex >= visibleOptions.length - 1 ? 0 : currentIndex + 1;
            });
          }

          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setIsExpanded(true);
            setActiveIndex((currentIndex) => {
              if (visibleOptions.length === 0) {
                return -1;
              }

              return currentIndex <= 0 ? visibleOptions.length - 1 : currentIndex - 1;
            });
          }

          if (event.key === 'Enter' && isExpanded && activeIndex >= 0) {
            event.preventDefault();
            const activeOption = visibleOptions[activeIndex];
            if (activeOption) {
              selectOption(activeOption);
            }
          }

          if (event.key === 'Escape') {
            setIsExpanded(false);
            setActiveIndex(-1);
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
            setActiveIndex(-1);
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
          {visibleOptions.map((option, index) => (
            <div
              key={option.value}
              aria-selected={index === activeIndex || option.value === value}
              className={index === activeIndex || option.value === value ? 'picker-option active' : 'picker-option'}
              id={optionId(index)}
              role="option"
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectOption(option)}
            >
              {option.media}
              <span>
                <strong>{option.label}</strong>
                {option.description ? <small>{option.description}</small> : null}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
