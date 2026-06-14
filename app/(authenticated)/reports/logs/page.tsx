'use client';

import dynamic from 'next/dynamic';

const LogsPage = dynamic(() => import('@/reports/LogsPage'), {
  ssr: false,
});

export default function Page() {
  return <LogsPage />;
}
