import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { normalizeSearch } from '../../utils/search';

export interface SearchableSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getLabel: (item: T) => string;
  getKey: (item: T) => number | string;
  /** Por defecto: el label contiene la búsqueda, sin distinguir mayúsculas ni tildes. */
  searchBy?: (item: T, query: string) => boolean;
  label?: string;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

export function SearchableSelect<T>({
  options,
  value,
  onChange,
  getLabel,
  getKey,
  searchBy,
  label,
  placeholder,
  emptyMessage = 'Sin resultados',
  disabled = false,
}: SearchableSelectProps<T>) {
  const inputId = useId();
  const listboxId = useId();
  const listboxRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  // Mientras el usuario no escribe, el input muestra el label del valor y la lista entera.
  const [isTyping, setIsTyping] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const trimmedQuery = query.trim();
  const filteredOptions =
    isTyping && trimmedQuery
      ? options.filter((item) =>
          searchBy
            ? searchBy(item, trimmedQuery)
            : normalizeSearch(getLabel(item)).includes(normalizeSearch(trimmedQuery)),
        )
      : options;

  const inputText = isTyping ? query : value ? getLabel(value) : '';
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return;
    const option = listboxRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    // jsdom no implementa scrollIntoView.
    option?.scrollIntoView?.({ block: 'nearest' });
  }, [isOpen, highlightedIndex]);

  const close = () => {
    setIsOpen(false);
    setIsTyping(false);
    setHighlightedIndex(-1);
  };

  const select = (item: T) => {
    onChange(item);
    close();
  };

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsTyping(true);
    setIsOpen(true);
    setHighlightedIndex(text.trim() ? 0 : -1);
    if (text === '' && value !== null) {
      onChange(null);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((index) => Math.min(index + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Enter':
        if (!isOpen) return;
        // Con la lista abierta, Enter elige; nunca envía el formulario que contiene al selector.
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          select(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={isOpen && highlightedIndex >= 0 ? optionId(highlightedIndex) : undefined}
          value={inputText}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => handleInputChange(event.target.value)}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          onBlur={close}
          onKeyDown={handleKeyDown}
          className="w-full min-h-11 bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 px-3.5 pr-10 text-sm transition-all duration-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:border-emerald-500 focus:ring-emerald-500/30 disabled:bg-slate-50 disabled:text-slate-400"
        />
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />

        {isOpen && (
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
            {filteredOptions.length === 0 ? (
              <p className="px-3.5 py-2.5 text-sm text-slate-500">{emptyMessage}</p>
            ) : (
              <ul ref={listboxRef} id={listboxId} role="listbox" className="max-h-60 overflow-auto py-1">
                {filteredOptions.map((item, index) => {
                  const isHighlighted = index === highlightedIndex;
                  const isSelected = value !== null && getKey(value) === getKey(item);
                  return (
                    <li
                      key={getKey(item)}
                      id={optionId(index)}
                      role="option"
                      aria-selected={isSelected}
                      // Sin esto, el mousedown saca el foco del input, el blur cierra la lista y el click
                      // nunca llega a la opción.
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`min-h-11 flex items-center cursor-pointer px-3.5 text-sm ${
                        isHighlighted ? 'bg-emerald-50 text-emerald-700' : 'text-slate-900'
                      } ${isSelected ? 'font-semibold' : ''}`}
                    >
                      {getLabel(item)}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchableSelect;
