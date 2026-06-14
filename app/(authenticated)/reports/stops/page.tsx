'use client';

import dynamic from 'next/dynamic';

const StopReportPage = dynamic(() => import('@/features/reports/StopReportPage'), {
  ssr: false,
});

export default function Page() {
  return <StopReportPage />;
}
