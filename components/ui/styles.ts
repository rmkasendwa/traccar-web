// @ts-nocheck
import { css, cx } from '@emotion/css';
import { useTheme } from '@/components/ui/theme';

export const makeStyles = () => (factory) => (params) => {
  const theme = useTheme();
  const definitions = typeof factory === 'function' ? factory(theme, params || {}) : factory;
  const classes = Object.fromEntries(
    Object.entries(definitions).map(([name, rules]) => [name, css(rules)]),
  );
  return { classes, cx };
};
