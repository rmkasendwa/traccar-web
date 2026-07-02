'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { useThemeMode } from '@/providers/AppThemeProvider';

const modes = [
  { value: 'system', label: 'System', icon: Laptop },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

type ThemeModeControlProps = {
  compact?: boolean;
  onDark?: boolean;
};

export default function ThemeModeControl({
  compact = false,
  onDark = false,
}: ThemeModeControlProps) {
  const { mode, setMode } = useThemeMode();

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
