'use client';

import dynamic from 'next/dynamic';

const TripReportPage = dynamic(() => import('@/features/reports/TripReportPage'), {
  ssr: false,
});

export default function Page() {
  return <TripReportPage />;
}
