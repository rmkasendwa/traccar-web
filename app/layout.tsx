import type { Metadata, Viewport } from 'next';
import NextTopLoader from 'nextjs-toploader';
import type { ReactNode } from 'react';
import AppProviders from '@/providers/AppProviders';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';
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
  const initialServer = await getInitialServer();

  return (
    <html lang="en" suppressHydrationWarning>
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
        <AppProviders initialServer={initialServer}>{children}</AppProviders>
      </body>
    </html>
  );
}
