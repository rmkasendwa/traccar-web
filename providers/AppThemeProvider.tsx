// @ts-nocheck
import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, useAppTheme, useMediaQuery } from '@/components/ui/theme';
import { useLocalization } from '@/providers/localization/LocalizationProvider';

type ThemeMode = 'system' | 'light' | 'dark';

const ThemeModeContext = createContext<{
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}>({ mode: 'system', setMode: () => {} });

export const useThemeMode = () => useContext(ThemeModeContext);

const AppThemeProvider = ({ children }) => {
  const server = useSelector((state) => state.session.server);
  const { direction } = useLocalization();
  const [mode, setModeState] = useState('system');
  const [ready, setReady] = useState(false);
  const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkMode = mode === 'dark' || (mode === 'system' && preferDarkMode);

  const themeInstance = useAppTheme(server, darkMode, direction);

  useEffect(() => {
    const storedMode = window.localStorage.getItem('themeMode');
    if (['system', 'light', 'dark'].includes(storedMode)) {
      setModeState(storedMode);
    }
    setReady(true);
  }, []);

  const setMode = (nextMode) => {
    window.localStorage.setItem('themeMode', nextMode);
    setModeState(nextMode);
  };

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
