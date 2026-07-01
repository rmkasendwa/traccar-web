// @ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useAsyncTask } from '@/lib/react';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const SelectField = ({
  label,
  fullWidth,
  multiple,
  value = null,
  emptyValue: _emptyValue = null,
  emptyTitle = '',
  onChange,
  endpoint,
  data,
  keyGetter = (item) => item.id,
  titleGetter = (item) => item.name,
  helperText,
  placeholder,
  singleLine: _singleLine,
  allValue,
  disabled = false,
}) => {
  const [items, setItems] = useState(data);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);

  const findOption = (option) => {
    if (typeof option === 'object') {
      return option;
    }
    return items.find((obj) => keyGetter(obj) === option);
  };

  useEffect(() => setItems(data), [data]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => !rootRef.current?.contains(event.target) && setOpen(false);
    const escape = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  useAsyncTask(
    async ({ signal }) => {
      if (endpoint) {
        const response = await fetchOrThrow(endpoint, { signal });
        setItems(await response.json());
      }
    },
    [endpoint],
  );

  if (items) {
    const selectedKeys = multiple ? value || [] : value == null ? [] : [value];
    const selectedItems = selectedKeys.map(findOption).filter(Boolean);
    const summary = selectedItems.length
      ? multiple && selectedItems.length > 1
        ? `${titleGetter(selectedItems[0])} +${selectedItems.length - 1}`
        : titleGetter(selectedItems[0])
      : placeholder || emptyTitle || 'Select…';
    const filteredItems = items.filter((item) =>
      titleGetter(item).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
    );
    const selectItem = (item) => {
      const key = keyGetter(item);
      if (!multiple) {
        onChange({ target: { value: key } });
        setOpen(false);
        setQuery('');
        return;
      }
      let nextValue = selectedKeys.includes(key)
        ? selectedKeys.filter((it) => it !== key)
        : [...selectedKeys, key];
      if (allValue && nextValue.includes(allValue)) {
        nextValue = key === allValue ? [allValue] : nextValue.filter((it) => it !== allValue);
      }
      onChange({ target: { value: nextValue } });
    };

    return (
      <div ref={rootRef} className={`relative ${fullWidth ? 'w-full' : ''}`}>
        {label && <span className="mb-1 block text-sm text-(--color-muted)">{label}</span>}
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-10 w-full items-center gap-2 rounded-xl border border-(--color-divider) bg-(--color-paper) px-3 text-left text-sm text-(--color-text) transition hover:border-slate-400 focus-visible:border-sky-500 focus-visible:outline-2 focus-visible:outline-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-(--color-divider)"
        >
          <span
            className={`min-w-0 flex-1 truncate ${selectedItems.length ? '' : 'text-(--color-muted)'}`}
          >
            {summary}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 text-(--color-muted) transition ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="absolute z-50 mt-2 w-full min-w-56 overflow-hidden rounded-xl border border-(--color-divider) bg-(--color-paper) p-1.5 text-(--color-text) shadow-2xl shadow-slate-950/20">
            <label className="mb-1.5 flex items-center gap-2 rounded-lg border border-(--color-divider) px-2.5">
              <Search size={15} className="shrink-0 text-(--color-muted)" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search…"
                className="min-h-9 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              />
            </label>
            <div
              role="listbox"
              aria-multiselectable={multiple || undefined}
              className="max-h-64 overflow-y-auto"
            >
              {filteredItems.map((item) => {
                const key = keyGetter(item);
                const selected = selectedKeys.includes(key);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    key={key}
                    onClick={() => selectItem(item)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition ${selected ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{titleGetter(item)}</span>
                    {selected && <Check size={16} className="shrink-0" />}
                  </button>
                );
              })}
              {!filteredItems.length && (
                <p className="px-3 py-5 text-center text-sm text-(--color-muted)">No matches</p>
              )}
            </div>
          </div>
        )}
        {helperText && (
          <span className="mt-1 block text-xs text-(--color-muted)">{helperText}</span>
        )}
      </div>
    );
  }
  return null;
};

export default SelectField;
