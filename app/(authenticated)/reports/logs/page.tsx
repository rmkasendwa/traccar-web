'use client';

import dynamic from 'next/dynamic';

const LogsPage = dynamic(() => import('@/features/reports/LogsPage'), {
  ssr: false,
});

export default function Page() {
  return <LogsPage />;
}
