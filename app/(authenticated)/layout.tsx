'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/components/layout/AppShell'), {
  ssr: false,
});

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <App>{children}</App>;
}
