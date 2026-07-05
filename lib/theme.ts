export const THEME_COOKIE = 'themeMode';

export const themeModes = ['system', 'light', 'dark'] as const;

export type ThemeMode = (typeof themeModes)[number];

export const isThemeMode = (mode: unknown): mode is ThemeMode =>
  typeof mode === 'string' && themeModes.includes(mode as ThemeMode);
