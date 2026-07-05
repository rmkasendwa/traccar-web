// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
} from '@floating-ui/react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useAsyncTask } from '@/lib/react';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

type SelectFieldProps = {
  className?: string;
  appearance?: 'default' | 'onDark';
  compact?: boolean;
  label?: string;
  fullWidth?: boolean;
  multiple?: boolean;
  value?: unknown;
  emptyValue?: unknown;
  emptyTitle?: string;
  onChange: (event: { target: { value: any } }) => void;
  endpoint?: string;
  data?: any[];
  keyGetter?: (item: any) => any;
  titleGetter?: (item: any) => string;
  summaryGetter?: (item: any) => string;
  helperText?: string;
  placeholder?: string;
  singleLine?: boolean;
  allValue?: unknown;
  disabled?: boolean;
};

const SelectField = ({
  className,
  appearance = 'default',
  compact = false,
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
  summaryGetter = titleGetter,
  helperText,
  placeholder,
  singleLine: _singleLine,
  allValue,
  disabled = false,
}: SelectFieldProps) => {
  const [items, setItems] = useState(data);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableWidth, availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${Math.min(Math.max(rects.reference.width, 224), availableWidth)}px`,
            maxHeight: `${availableHeight}px`,
          });
        },
      }),
    ],
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  const findOption = (option) => {
    if (typeof option === 'object') {
      return option;
    }
    return items.find((obj) => keyGetter(obj) === option);
  };

  useEffect(() => setItems(data), [data]);

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
    const selectedKeys = value == null ? [] : multiple && Array.isArray(value) ? value : [value];
    const selectedItems = selectedKeys.map(findOption).filter(Boolean);
    const summary = selectedItems.length
      ? multiple && selectedItems.length > 1
        ? `${titleGetter(selectedItems[0])} +${selectedItems.length - 1}`
        : summaryGetter(selectedItems[0])
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
      <div className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}>
        {label && <span className="mb-1 block text-sm text-(--color-muted)">{label}</span>}
        <button
          ref={refs.setReference}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          className={`flex w-full items-center gap-2 border text-left text-sm transition focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50 ${compact ? 'min-h-8 rounded-lg px-2.5' : 'min-h-10 rounded-xl px-3'} ${
            appearance === 'onDark'
              ? 'border-white/10 bg-white/8 text-white hover:border-white/20 hover:bg-white/12 focus-visible:border-sky-400 focus-visible:outline-sky-400/25'
              : 'border-(--color-divider) bg-(--color-paper) text-(--color-text) hover:border-slate-400 focus-visible:border-sky-500 focus-visible:outline-sky-500/20 disabled:hover:border-(--color-divider)'
          }`}
          {...getReferenceProps()}
        >
          <span
            className={`min-w-0 flex-1 truncate ${selectedItems.length ? '' : appearance === 'onDark' ? 'text-white/65' : 'text-(--color-muted)'}`}
          >
            {summary}
          </span>
          <ChevronDown
            size={16}
            className={`shrink-0 transition ${appearance === 'onDark' ? 'text-white/60' : 'text-(--color-muted)'} ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-100 overflow-hidden rounded-xl border border-(--color-divider) bg-(--color-paper) p-1.5 text-(--color-text) shadow-2xl shadow-slate-950/20"
              {...getFloatingProps()}
            >
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
          </FloatingPortal>
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
