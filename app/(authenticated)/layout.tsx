'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('@/App'), {
  ssr: false,
});

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <App>{children}</App>;
}
