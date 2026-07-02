// @ts-nocheck
'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import dimensions from '@/components/ui/dimensions';

const screens = { sm: 600, md: 900, lg: 1200, xl: 1536 };
const spacing = (value) => `${value * 8}px`;

const buildTheme = (server, darkMode, direction) => {
  const primary = server?.attributes?.colorPrimary || (darkMode ? '#38bdf8' : '#0284c7');
  const secondary = server?.attributes?.colorSecondary || (darkMode ? '#a5d6a7' : '#2e7d32');
  return {
    direction,
    dimensions,
    spacing,
    breakpoints: {
      up: (key) => `@media (min-width:${screens[key]}px)`,
      down: (key) => `@media (max-width:${screens[key] - 0.05}px)`,
    },
    transitions: {
      create: (property) => `${property} 225ms cubic-bezier(0.4, 0, 0.2, 1)`,
      duration: { enteringScreen: 225 },
      easing: { sharp: 'cubic-bezier(0.4, 0, 0.6, 1)' },
    },
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: primary, contrastText: '#fff' },
      secondary: { main: secondary, contrastText: '#fff' },
      background: {
        default: darkMode ? '#0f172a' : '#fafafa',
        paper: darkMode ? '#172033' : '#fff',
      },
      text: {
        primary: darkMode ? '#f1f5f9' : '#1f2937',
        secondary: darkMode ? '#a8b3c5' : '#6b7280',
      },
      divider: darkMode ? '#2d3a52' : '#e5e7eb',
      action: {
        selected: darkMode ? '#374151' : '#eef2ff',
        disabledBackground: darkMode ? '#374151' : '#e5e7eb',
      },
      common: { white: '#fff' },
      error: { main: '#dc2626', light: '#fecaca' },
      warning: { main: '#d97706' },
      info: { main: '#0284c7' },
      success: { main: '#16a34a', light: '#bbf7d0' },
      neutral: { main: '#6b7280' },
      geometry: { main: '#3bb2d0' },
      alwaysDark: { main: '#111827' },
    },
  };
};

const ThemeContext = createContext(buildTheme(null, false, 'ltr'));

export const ThemeProvider = ({ theme, children }) => (
  <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
);

export const useTheme = () => useContext(ThemeContext);

export const useMediaQuery = (queryOrCallback) => {
  const theme = useTheme();
  const query = typeof queryOrCallback === 'function' ? queryOrCallback(theme) : queryOrCallback;
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query.replace('@media ', ''));
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
};

export const useAppTheme = (server, darkMode, direction) =>
  useMemo(() => buildTheme(server, darkMode, direction), [server, darkMode, direction]);

export const createTheme = (options = {}) => ({
  ...buildTheme(null, options.palette?.mode === 'dark', options.direction || 'ltr'),
  ...options,
  palette: {
    ...buildTheme(null, options.palette?.mode === 'dark', options.direction || 'ltr').palette,
    ...options.palette,
  },
});

export const colors = {
  grey: { 50: '#fafafa', 500: '#6b7280', 900: '#111827' },
  green: { 200: '#bbf7d0', 800: '#166534' },
  indigo: { 200: '#c7d2fe', 900: '#312e81' },
};

export const { grey, green, indigo } = colors;
