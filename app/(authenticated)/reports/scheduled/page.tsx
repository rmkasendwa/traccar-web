'use client';

import dynamic from 'next/dynamic';

const ScheduledPage = dynamic(() => import('@/features/reports/ScheduledPage'), {
  ssr: false,
});

export default function Page() {
  return <ScheduledPage />;
}
