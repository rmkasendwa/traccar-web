'use client';

import dynamic from 'next/dynamic';

const EventReportPage = dynamic(() => import('@/features/reports/EventReportPage'), {
  ssr: false,
});

export default function Page() {
  return <EventReportPage />;
}
