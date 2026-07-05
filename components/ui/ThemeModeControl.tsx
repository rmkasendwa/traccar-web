'use client';

import { useState } from 'react';
import { Check, Laptop, Moon, Sun } from 'lucide-react';
import { useThemeMode } from '@/providers/AppThemeProvider';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';

const modes = [
  { value: 'system', label: 'System', icon: Laptop },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

type ThemeModeControlProps = {
  compact?: boolean;
  onDark?: boolean;
  popover?: boolean;
};

export default function ThemeModeControl({
  compact = false,
  onDark = false,
  popover = false,
}: ThemeModeControlProps) {
  const { mode, setMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const activeMode = modes.find((item) => item.value === mode) || modes[0];

  if (popover) {
    const ActiveIcon = activeMode.icon;
    return (
      <FloatingPanel
        open={open}
        onOpenChange={setOpen}
        className="w-40 p-1.5"
        trigger={(props, ref) => (
          <button
            ref={ref as (node: HTMLButtonElement | null) => void}
            type="button"
            aria-label={`Color theme: ${activeMode.label}`}
            aria-haspopup="menu"
            aria-expanded={open}
            title="Color theme"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
              onDark
                ? 'border-white/10 bg-white/8 text-white hover:border-white/20 hover:bg-white/12'
                : 'border-(--color-divider) bg-(--color-paper) text-(--color-text) hover:bg-(--color-surface-hover)'
            }`}
            {...props}
          >
            <ActiveIcon size={16} aria-hidden="true" />
          </button>
        )}
      >
        {modes.map(({ value, label, icon: Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => {
                setMode(value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                active
                  ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {active && <Check size={15} aria-hidden="true" />}
            </button>
          );
        })}
      </FloatingPanel>
    );
  }

  return (
    <div
      className={`grid grid-cols-3 gap-1 rounded-xl border p-1 ${
        onDark
          ? 'border-white/10 bg-white/8'
          : 'border-(--color-divider) bg-(--color-surface-subtle)'
      }`}
      role="group"
      aria-label="Color theme"
    >
      {modes.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={active}
            title={`${label} theme`}
            className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500 ${compact ? 'h-7 w-7' : 'min-h-9 px-2'} ${
              onDark
                ? active
                  ? 'bg-white/15 text-sky-300 shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
                : active
                  ? 'bg-(--color-paper) text-sky-600 shadow-sm dark:text-sky-400'
                  : 'text-(--color-muted) hover:bg-(--color-surface-hover) hover:text-(--color-text)'
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            <span className={compact ? 'sr-only' : ''}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
