'use client';

import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { LocalizationProvider } from './common/components/LocalizationProvider';
import ErrorHandler from './common/components/ErrorHandler';
import Navigation from './Navigation';
import preloadImages from './map/core/preloadImages';
import NativeInterface from './common/components/NativeInterface';
import ServerProvider from './ServerProvider';
import ErrorBoundary from './ErrorBoundary';
import AppThemeProvider from './AppThemeProvider';

export default function ClientApp() {
  useEffect(() => {
    preloadImages();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <LocalizationProvider>
          <AppThemeProvider>
            <ServerProvider>
              <BrowserRouter>
                <Navigation />
              </BrowserRouter>
              <ErrorHandler />
              <NativeInterface />
            </ServerProvider>
          </AppThemeProvider>
        </LocalizationProvider>
      </Provider>
    </ErrorBoundary>
  );
}
