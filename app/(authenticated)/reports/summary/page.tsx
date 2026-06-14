'use client';

import dynamic from 'next/dynamic';

const SummaryReportPage = dynamic(() => import('@/features/reports/SummaryReportPage'), {
  ssr: false,
});

export default function Page() {
  return <SummaryReportPage />;
}
