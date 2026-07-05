'use client';

import { default as CountryFlag } from 'react-country-flag';
import { useSelector } from 'react-redux';
import { useLocalization, useTranslation } from '@/providers/localization/LocalizationProvider';

type SessionState = {
  session: {
    server?: {
      attributes?: Record<string, unknown>;
    } | null;
  };
};

type Language = {
  country: string;
  name: string;
};

export default function LanguageSelect() {
  const t = useTranslation() as (key: string) => string;
  const { languages, language, setLocalLanguage } = useLocalization() as {
    languages: Record<string, Language>;
    language: string;
    setLocalLanguage: (language: string) => void;
  };
  const enabled = useSelector(
    (state: SessionState) => !state.session.server?.attributes?.['ui.disableLoginLanguage'],
  );

  if (!enabled) {
    return null;
  }

  return (
    <label className="relative flex items-center">
      <span className="sr-only">{t('loginLanguage')}</span>
      <CountryFlag
        countryCode={languages[language].country}
        svg
        aria-hidden="true"
        className="pointer-events-none absolute left-3 z-10"
      />
      <select
        aria-label={t('loginLanguage')}
        className="min-h-10 max-w-44 appearance-none rounded-md border border-white/25 bg-white/10 py-2 pl-9 pr-8 text-sm font-medium text-white outline-none hover:bg-white/15 focus:border-white/60 focus:ring-2 focus:ring-white/25"
        value={language}
        onChange={(event) => setLocalLanguage(event.target.value)}
      >
        {Object.entries(languages).map(([code, item]) => (
          <option key={code} value={code} className="bg-slate-900 text-white">
            {item.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-xs text-white/70">▾</span>
    </label>
  );
}
