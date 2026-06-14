'use client';

import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import { LocalizationProvider } from './common/components/LocalizationProvider';
import ErrorHandler from './common/components/ErrorHandler';
import NativeInterface from './common/components/NativeInterface';
import ServerProvider from './ServerProvider';
import ErrorBoundary from './ErrorBoundary';
import AppThemeProvider from './AppThemeProvider';
import QueryParameterController from './QueryParameterController';

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    import('./map/core/preloadImages').then(({ default: preloadImages }) => preloadImages());
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <LocalizationProvider>
          <AppThemeProvider>
            <ServerProvider>
              <QueryParameterController>{children}</QueryParameterController>
              <ErrorHandler />
              <NativeInterface />
            </ServerProvider>
          </AppThemeProvider>
        </LocalizationProvider>
      </Provider>
    </ErrorBoundary>
  );
}
