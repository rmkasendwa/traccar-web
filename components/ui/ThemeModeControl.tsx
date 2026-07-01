'use client';

import { Laptop, Moon, Sun } from 'lucide-react';
import { useThemeMode } from '@/providers/AppThemeProvider';

const modes = [
  { value: 'system', label: 'System', icon: Laptop },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const;

export default function ThemeModeControl() {
  const { mode, setMode } = useThemeMode();

  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-xl border border-(--color-divider) bg-(--color-surface-subtle) p-1"
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
            className={`flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500 ${
              active
                ? 'bg-(--color-paper) text-sky-600 shadow-sm dark:text-sky-400'
                : 'text-(--color-muted) hover:bg-(--color-surface-hover) hover:text-(--color-text)'
            }`}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
