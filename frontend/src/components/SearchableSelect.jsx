import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

/**
 * A searchable single-select "combobox" — visually matches FormField's
 * input styling. Unlike a plain <select>, options filter live as you type,
 * but the underlying value can only ever be one of the provided `options`
 * (typed text that doesn't match a selection is discarded on close), so it
 * always behaves as a true select, never free text.
 *
 * `options`: [{ id, label }]. `value`: the selected option's id (or "").
 * `onChange(id)`: called with the new id ("" when cleared).
 * `allowClear`: shows a clear (X) button and an "All ..." style placeholder
 * option is expected to be represented by value === "".
 */
export default function SearchableSelect({
  label,
  id,
  value,
  onChange,
  options,
  placeholder = "Search…",
  required = false,
  allowClear = false,
  error,
  wrapperClassName = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = useMemo(() => options.find((o) => String(o.id) === String(value)) || null, [options, value]);

  useEffect(() => {
    if (!open) {
      setQuery(selected ? selected.label : "");
    }
  }, [open, selected]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function selectOption(option) {
    onChange(option ? String(option.id) : "");
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setHighlight(0);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlight]) selectOption(filtered[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const baseInput = `w-full rounded-md border py-2 pl-9 pr-8 text-sm shadow-sm focus:outline-none focus:ring-1 ${
    error ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-navy-600 focus:ring-navy-600"
  }`;

  return (
    <div className={`mb-4 ${wrapperClassName}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          autoComplete="off"
          required={required && !value}
          className={baseInput}
          placeholder={placeholder}
          value={open ? query : selected?.label || ""}
          onFocus={() => {
            setOpen(true);
            setHighlight(0);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <div className="pointer-events-none absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {allowClear && value && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                selectOption(null);
              }}
              className="pointer-events-auto rounded p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>

        {open && (
          <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
            {allowClear && (
              <li>
                <button
                  type="button"
                  onClick={() => selectOption(null)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50 ${
                    !value ? "font-medium text-navy-900" : "text-gray-700"
                  }`}
                >
                  All
                  {!value && <Check className="h-4 w-4 text-navy-700" />}
                </button>
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-gray-400">No matches found.</li>
            ) : (
              filtered.map((option, idx) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setHighlight(idx)}
                    onClick={() => selectOption(option)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left ${
                      idx === highlight ? "bg-navy-50" : ""
                    } ${String(option.id) === String(value) ? "font-medium text-navy-900" : "text-gray-700"}`}
                  >
                    {option.label}
                    {String(option.id) === String(value) && <Check className="h-4 w-4 text-navy-700" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
