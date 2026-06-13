'use client';

import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('@/ClientApp'), {
  ssr: false,
  loading: () => <div className="flex min-h-screen items-center justify-center">Loading...</div>,
});

export default function Page() {
  return <ClientApp />;
}
