import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import type { ReactNode } from 'react';
import { cookies, headers } from 'next/headers';
import AppProviders from '@/providers/AppProviders';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';
import {
  getLanguageDirection,
  isSupportedLanguage,
  LANGUAGE_COOKIE,
  matchLanguage,
} from '@/lib/localization';
import en from '@/providers/localization/messages/en.json';
import './globals.css';

export const metadata: Metadata = {
  title: 'Traccar',
  description: 'Traccar GPS tracking',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon-180x180.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0284c7',
};

const getInitialServer = async () => {
  try {
    const response = await fetchFromRequestOrigin('/api/server');
    return response?.ok ? response.json() : null;
  } catch {
    return null;
  }
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [initialServer, cookieStore, headerStore] = await Promise.all([
    getInitialServer(),
    cookies(),
    headers(),
  ]);
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value;
  const serverLanguage = initialServer?.attributes?.language;
  const acceptedLanguage = headerStore
    .get('accept-language')
    ?.split(',')
    .map(matchLanguage)
    .find(Boolean);
  const initialLanguage = isSupportedLanguage(cookieLanguage)
    ? cookieLanguage
    : isSupportedLanguage(serverLanguage)
      ? serverLanguage
      : acceptedLanguage || 'en';
  const initialMessages =
    initialLanguage === 'en'
      ? en
      : (await import(`@/providers/localization/messages/${initialLanguage}.json`)).default;
  const direction = getLanguageDirection(initialLanguage);

  return (
    <html lang={initialLanguage.replace('_', '-')} dir={direction} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('themeMode')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <NextTopLoader
          color="var(--color-primary)"
          height={3}
          showSpinner={false}
          shadow={false}
          zIndex={9999}
        />
        <AppProviders
          initialServer={initialServer}
          initialLanguage={initialLanguage}
          initialMessages={initialMessages}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
