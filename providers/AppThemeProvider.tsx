// @ts-nocheck
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, useAppTheme, useMediaQuery } from '@/components/ui/theme';
import { useLocalization } from '@/providers/localization/LocalizationProvider';
import { isThemeMode, THEME_COOKIE, type ThemeMode } from '@/lib/theme';

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}>({ mode: 'system', setMode: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

const AppThemeProvider = ({ children, initialMode }) => {
  const server = useSelector((state) => state.session.server);
  const { direction } = useLocalization();
  const [mode, setModeState] = useState(initialMode);
  const [ready, setReady] = useState(initialMode !== 'system');
  const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkMode = mode === 'dark' || (mode === 'system' && preferDarkMode);

  const themeInstance = useAppTheme(server, darkMode, direction);

  const setMode = useCallback((nextMode) => {
    if (isThemeMode(nextMode)) {
      document.cookie = `${THEME_COOKIE}=${nextMode}; Path=/; Max-Age=31536000; SameSite=Lax`;
      setModeState(nextMode);
    }
  }, []);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.dir = direction;
    document.documentElement.style.setProperty(
      '--color-primary',
      themeInstance.palette.primary.main,
    );
    document.documentElement.style.setProperty(
      '--color-secondary',
      themeInstance.palette.secondary.main,
    );
  }, [darkMode, direction, ready, themeInstance]);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={themeInstance}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default AppThemeProvider;
