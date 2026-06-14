import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import AppProviders from '@/providers/AppProviders';
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
  themeColor: '#1a237e',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
