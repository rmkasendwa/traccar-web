// @ts-nocheck
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { getLanguageDirection, isSupportedLanguage, LANGUAGE_COOKIE } from '@/lib/localization';

import en from '@/providers/localization/messages/en.json';
import 'dayjs/locale/en';

const dayjsLoaders = {
  af: () => import('dayjs/locale/af.js'),
  ar: () => import('dayjs/locale/ar.js'),
  az: () => import('dayjs/locale/az.js'),
  bg: () => import('dayjs/locale/bg.js'),
  bn: () => import('dayjs/locale/bn.js'),
  ca: () => import('dayjs/locale/ca.js'),
  cs: () => import('dayjs/locale/cs.js'),
  da: () => import('dayjs/locale/da.js'),
  de: () => import('dayjs/locale/de.js'),
  el: () => import('dayjs/locale/el.js'),
  es: () => import('dayjs/locale/es.js'),
  fa: () => import('dayjs/locale/fa.js'),
  fi: () => import('dayjs/locale/fi.js'),
  fr: () => import('dayjs/locale/fr.js'),
  gl: () => import('dayjs/locale/gl.js'),
  he: () => import('dayjs/locale/he.js'),
  hi: () => import('dayjs/locale/hi.js'),
  hr: () => import('dayjs/locale/hr.js'),
  hu: () => import('dayjs/locale/hu.js'),
  id: () => import('dayjs/locale/id.js'),
  it: () => import('dayjs/locale/it.js'),
  ja: () => import('dayjs/locale/ja.js'),
  ka: () => import('dayjs/locale/ka.js'),
  kk: () => import('dayjs/locale/kk.js'),
  km: () => import('dayjs/locale/km.js'),
  ko: () => import('dayjs/locale/ko.js'),
  lo: () => import('dayjs/locale/lo.js'),
  lt: () => import('dayjs/locale/lt.js'),
  lv: () => import('dayjs/locale/lv.js'),
  mk: () => import('dayjs/locale/mk.js'),
  ml: () => import('dayjs/locale/ml.js'),
  mn: () => import('dayjs/locale/mn.js'),
  ms: () => import('dayjs/locale/ms.js'),
  nb: () => import('dayjs/locale/nb.js'),
  ne: () => import('dayjs/locale/ne.js'),
  nl: () => import('dayjs/locale/nl.js'),
  nn: () => import('dayjs/locale/nn.js'),
  pl: () => import('dayjs/locale/pl.js'),
  pt: () => import('dayjs/locale/pt.js'),
  pt_BR: () => import('dayjs/locale/pt-br.js'),
  ro: () => import('dayjs/locale/ro.js'),
  ru: () => import('dayjs/locale/ru.js'),
  si: () => import('dayjs/locale/si.js'),
  sk: () => import('dayjs/locale/sk.js'),
  sl: () => import('dayjs/locale/sl.js'),
  sq: () => import('dayjs/locale/sq.js'),
  sr: () => import('dayjs/locale/sr.js'),
  sv: () => import('dayjs/locale/sv.js'),
  ta: () => import('dayjs/locale/ta.js'),
  th: () => import('dayjs/locale/th.js'),
  tr: () => import('dayjs/locale/tr.js'),
  uk: () => import('dayjs/locale/uk.js'),
  uz: () => import('dayjs/locale/uz.js'),
  vi: () => import('dayjs/locale/vi.js'),
  zh: () => import('dayjs/locale/zh.js'),
  zh_TW: () => import('dayjs/locale/zh-tw.js'),
};

const languages = {
  af: { country: 'ZA', name: 'Afrikaans' },
  ar: { country: 'AE', name: 'العربية' },
  az: { country: 'AZ', name: 'Azərbaycanca' },
  bg: { country: 'BG', name: 'Български' },
  bn: { country: 'IN', name: 'বাংলা' },
  ca: { country: 'ES', name: 'Català' },
  cs: { country: 'CZ', name: 'Čeština' },
  de: { country: 'DE', name: 'Deutsch' },
  da: { country: 'DK', name: 'Dansk' },
  el: { country: 'GR', name: 'Ελληνικά' },
  en: { country: 'US', name: 'English' },
  es: { country: 'ES', name: 'Español' },
  fa: { country: 'IR', name: 'فارسی' },
  fi: { country: 'FI', name: 'Suomi' },
  fr: { country: 'FR', name: 'Français' },
  gl: { country: 'ES', name: 'Galego' },
  he: { country: 'IL', name: 'עברית' },
  hi: { country: 'IN', name: 'हिन्दी' },
  hr: { country: 'HR', name: 'Hrvatski' },
  hu: { country: 'HU', name: 'Magyar' },
  id: { country: 'ID', name: 'Bahasa Indonesia' },
  it: { country: 'IT', name: 'Italiano' },
  ja: { country: 'JP', name: '日本語' },
  ka: { country: 'GE', name: 'ქართული' },
  kk: { country: 'KZ', name: 'Қазақша' },
  ko: { country: 'KR', name: '한국어' },
  km: { country: 'KH', name: 'ភាសាខ្មែរ' },
  lo: { country: 'LA', name: 'ລາວ' },
  lt: { country: 'LT', name: 'Lietuvių' },
  lv: { country: 'LV', name: 'Latviešu' },
  mk: { country: 'MK', name: 'Mакедонски' },
  ml: { country: 'IN', name: 'മലയാളം' },
  mn: { country: 'MN', name: 'Монгол хэл' },
  ms: { country: 'MY', name: 'بهاس ملايو' },
  nb: { country: 'NO', name: 'Norsk bokmål' },
  ne: { country: 'NP', name: 'नेपाली' },
  nl: { country: 'NL', name: 'Nederlands' },
  nn: { country: 'NO', name: 'Norsk nynorsk' },
  pl: { country: 'PL', name: 'Polski' },
  pt: { country: 'PT', name: 'Português' },
  pt_BR: { country: 'BR', name: 'Português (Brasil)' },
  ro: { country: 'RO', name: 'Română' },
  ru: { country: 'RU', name: 'Русский' },
  si: { country: 'LK', name: 'සිංහල' },
  sk: { country: 'SK', name: 'Slovenčina' },
  sl: { country: 'SI', name: 'Slovenščina' },
  sq: { country: 'AL', name: 'Shqipëria' },
  sr: { country: 'RS', name: 'Srpski' },
  sv: { country: 'SE', name: 'Svenska' },
  ta: { country: 'IN', name: 'தமிழ்' },
  th: { country: 'TH', name: 'ไทย' },
  tr: { country: 'TR', name: 'Türkçe' },
  uk: { country: 'UA', name: 'Українська' },
  uz: { country: 'UZ', name: 'Oʻzbekcha' },
  vi: { country: 'VN', name: 'Tiếng Việt' },
  zh: { country: 'CN', name: '中文' },
  zh_TW: { country: 'TW', name: '中文 (Taiwan)' },
};

const cache = new Map([['en', Promise.resolve({ data: en, dayjsName: 'en' })]]);

const loadLocale = (language) => {
  if (!cache.has(language)) {
    const dataLoader = () => import(`./messages/${language}.json`);
    const dayjsLoader = dayjsLoaders[language];
    cache.set(
      language,
      Promise.all([dataLoader(), dayjsLoader()]).then(([dataMod, dayjsMod]) => ({
        data: dataMod.default,
        dayjsName: dayjsMod.default.name,
      })),
    );
  }
  return cache.get(language);
};

const LocalizationContext = createContext({
  languages,
  language: 'en',
  setLocalLanguage: () => {},
  direction: 'ltr',
});

const ResolvedLocalizationProvider = ({ language, data, setLocalLanguage, children }) => {
  const direction = getLanguageDirection(language);

  const value = useMemo(
    () => ({
      languages: { ...languages, [language]: { ...languages[language], data } },
      language,
      setLocalLanguage,
      direction,
    }),
    [language, data, setLocalLanguage, direction],
  );

  useEffect(() => {
    document.dir = direction;
    document.documentElement.lang = language.replace('_', '-');
  }, [direction, language]);

  return <LocalizationContext value={value}>{children}</LocalizationContext>;
};

export const LocalizationProvider = ({ children, initialLanguage, initialMessages }) => {
  const userLanguage = useSelector((state) => {
    const userLanguage = state.session.user?.attributes?.language;
    return userLanguage && userLanguage in languages ? userLanguage : null;
  });

  const [localLanguage, setLocalLanguageState] = useState(initialLanguage);
  const setLocalLanguage = useCallback((nextLanguage) => {
    if (isSupportedLanguage(nextLanguage)) {
      document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(nextLanguage)}; Path=/; Max-Age=31536000; SameSite=Lax`;
      setLocalLanguageState(nextLanguage);
    }
  }, []);

  const language = userLanguage || localLanguage;
  const [resolvedLocale, setResolvedLocale] = useState({
    language: initialLanguage,
    data: initialMessages,
  });

  useEffect(() => {
    let active = true;
    loadLocale(language).then(({ data, dayjsName }) => {
      if (active) {
        dayjs.locale(dayjsName);
        setResolvedLocale({ language, data });
      }
    });
    return () => {
      active = false;
    };
  }, [language]);

  return (
    <ResolvedLocalizationProvider
      language={resolvedLocale.language}
      data={resolvedLocale.data}
      setLocalLanguage={setLocalLanguage}
    >
      {children}
    </ResolvedLocalizationProvider>
  );
};

export const useLocalization = () => use(LocalizationContext);

export const useTranslation = () => {
  const context = use(LocalizationContext);
  const { data } = context.languages[context.language];
  return useMemo(() => (key) => data[key] ?? en[key] ?? key, [data]);
};

export const useTranslationKeys = (predicate) => {
  const context = use(LocalizationContext);
  const { data } = context.languages[context.language];
  return Object.keys(data).filter(predicate);
};
