// @ts-nocheck
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ThemeProvider, useAppTheme, useMediaQuery } from './components/theme';
import { useLocalization } from './common/components/LocalizationProvider';

const AppThemeProvider = ({ children }) => {
  const server = useSelector((state) => state.session.server);
  const { direction } = useLocalization();

  const serverDarkMode = server?.attributes?.darkMode;
  const preferDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const darkMode = serverDarkMode !== undefined ? serverDarkMode : preferDarkMode;

  const themeInstance = useAppTheme(server, darkMode, direction);

  useEffect(() => {
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
  }, [darkMode, direction, themeInstance]);

  return <ThemeProvider theme={themeInstance}>{children}</ThemeProvider>;
};

export default AppThemeProvider;
