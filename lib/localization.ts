export const LANGUAGE_COOKIE = 'language';

export const supportedLanguages = [
  'af',
  'ar',
  'az',
  'bg',
  'bn',
  'ca',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'es',
  'fa',
  'fi',
  'fr',
  'gl',
  'he',
  'hi',
  'hr',
  'hu',
  'id',
  'it',
  'ja',
  'ka',
  'kk',
  'km',
  'ko',
  'lo',
  'lt',
  'lv',
  'mk',
  'ml',
  'mn',
  'ms',
  'nb',
  'ne',
  'nl',
  'nn',
  'pl',
  'pt',
  'pt_BR',
  'ro',
  'ru',
  'si',
  'sk',
  'sl',
  'sq',
  'sr',
  'sv',
  'ta',
  'th',
  'tr',
  'uk',
  'uz',
  'vi',
  'zh',
  'zh_TW',
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export const isSupportedLanguage = (language: unknown): language is SupportedLanguage =>
  typeof language === 'string' && supportedLanguages.includes(language as never);

export const matchLanguage = (value: string | null | undefined) => {
  if (!value) return null;
  const language = value.split(';')[0].trim().replace('-', '_');
  if (isSupportedLanguage(language)) return language;
  const shortLanguage = language.substring(0, 2);
  return isSupportedLanguage(shortLanguage) ? shortLanguage : null;
};

export const getLanguageDirection = (language: string) =>
  /^(ar|he|fa)$/.test(language) ? 'rtl' : 'ltr';
