'use client';

import { useSelector } from 'react-redux';
import SelectField from '@/components/ui/SelectField';
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

type LanguageOption = Language & {
  code: string;
};

const countryFlag = (country: string) =>
  String.fromCodePoint(...[...country].map((character) => 127397 + character.charCodeAt(0)));

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

  const languageList: LanguageOption[] = Object.entries(languages).map(([code, item]) => ({
    code,
    ...item,
  }));

  return (
    <SelectField
      appearance="onDark"
      compact
      className="w-34"
      value={language}
      data={languageList}
      keyGetter={(item: LanguageOption) => item.code}
      titleGetter={(item: LanguageOption) => `${countryFlag(item.country)}  ${item.name}`}
      summaryGetter={(item: LanguageOption) => `${countryFlag(item.country)}  ${item.name}`}
      placeholder={t('loginLanguage')}
      onChange={(event) => setLocalLanguage(event.target.value)}
    />
  );
}
