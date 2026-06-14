'use client';

import dynamic from 'next/dynamic';

const EventReportPage = dynamic(() => import('@/reports/EventReportPage'), {
  ssr: false,
});

export default function Page() {
  return <EventReportPage />;
}
