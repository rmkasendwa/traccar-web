'use client';

import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import store, { sessionActions } from '@/store';
import { LocalizationProvider } from '@/providers/localization/LocalizationProvider';
import ErrorHandler from '@/controllers/ErrorHandler';
import NativeInterface from '@/controllers/NativeInterface';
import ServerProvider from '@/providers/ServerProvider';
import ErrorBoundary from '@/providers/ErrorBoundary';
import AppThemeProvider from '@/providers/AppThemeProvider';
import QueryParameterController from '@/controllers/QueryParameterController';

type AppProvidersProps = {
  children: ReactNode;
  initialServer?: unknown;
  initialLanguage: string;
  initialMessages: Record<string, string>;
};

export default function AppProviders({
  children,
  initialServer,
  initialLanguage,
  initialMessages,
}: AppProvidersProps) {
  if (initialServer && !store.getState().session.server) {
    store.dispatch(sessionActions.updateServer(initialServer));
  }

  useEffect(() => {
    import('@/features/map/core/preloadImages').then(({ default: preloadImages }) =>
      preloadImages(),
    );
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <LocalizationProvider initialLanguage={initialLanguage} initialMessages={initialMessages}>
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
