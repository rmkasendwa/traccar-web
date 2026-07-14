'use client';

import { useMemo, useState } from 'react';
import { Check, Languages, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';
import { useLocalization, useTranslation } from '@/providers/localization/LocalizationProvider';

type Language = {
  country: string;
  name: string;
};

type LanguageOption = Language & {
  code: string;
};

type LanguageControlProps = {
  onDark?: boolean;
  hideWhenLoginLanguageDisabled?: boolean;
};

type SessionState = {
  session: {
    server?: {
      attributes?: Record<string, unknown>;
    } | null;
  };
};

const countryFlag = (country: string) =>
  String.fromCodePoint(...[...country].map((character) => 127397 + character.charCodeAt(0)));

export default function LanguageControl({
  onDark = false,
  hideWhenLoginLanguageDisabled = false,
}: LanguageControlProps) {
  const t = useTranslation() as (key: string) => string;
  const { languages, language, setLocalLanguage } = useLocalization() as {
    languages: Record<string, Language>;
    language: string;
    setLocalLanguage: (language: string) => void;
  };
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const enabled = useSelector(
    (state: SessionState) =>
      !hideWhenLoginLanguageDisabled ||
      !state.session.server?.attributes?.['ui.disableLoginLanguage'],
  );

  const languageList: LanguageOption[] = useMemo(
    () =>
      Object.entries(languages)
        .map(([code, item]) => ({ code, ...item }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [languages],
  );
  const activeLanguage = languageList.find((item) => item.code === language);
  const filteredLanguages = languageList.filter((item) => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return (
      item.name.toLocaleLowerCase().includes(normalizedQuery) ||
      item.code.toLocaleLowerCase().includes(normalizedQuery)
    );
  });

  if (!enabled) {
    return null;
  }

  return (
    <FloatingPanel
      open={open}
      onOpenChange={setOpen}
      placement="bottom-end"
      className="w-64 p-1.5"
      trigger={(props, ref) => (
        <button
          ref={ref as (node: HTMLButtonElement | null) => void}
          type="button"
          aria-label={`${t('loginLanguage')}: ${activeLanguage?.name || language}`}
          aria-haspopup="menu"
          aria-expanded={open}
          title={t('loginLanguage')}
          className={`flex h-7 w-7 items-center justify-center rounded-md border transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
            onDark
              ? 'border-transparent bg-transparent text-white/65 hover:bg-white/6 hover:text-white'
              : 'border-(--color-divider) bg-(--color-paper) text-(--color-text) hover:bg-(--color-surface-hover)'
          }`}
          {...props}
        >
          <Languages size={14} aria-hidden="true" />
        </button>
      )}
    >
      <label className="mb-1.5 flex items-center gap-2 rounded-lg border border-(--color-divider) px-2.5">
        <Search size={15} className="shrink-0 text-(--color-muted)" aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search..."
          className="min-h-9 min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
        />
      </label>
      <div role="menu" className="max-h-72 overflow-y-auto">
        {filteredLanguages.map((item) => {
          const active = item.code === language;
          return (
            <button
              key={item.code}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => {
                setLocalLanguage(item.code);
                setOpen(false);
                setQuery('');
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition ${
                active
                  ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="shrink-0">{countryFlag(item.country)}</span>
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              {active && <Check size={15} className="shrink-0" aria-hidden="true" />}
            </button>
          );
        })}
        {!filteredLanguages.length && (
          <p className="px-3 py-5 text-center text-sm text-(--color-muted)">No matches</p>
        )}
      </div>
    </FloatingPanel>
  );
}
