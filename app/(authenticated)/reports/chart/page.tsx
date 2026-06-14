'use client';

import dynamic from 'next/dynamic';

const ChartReportPage = dynamic(() => import('@/features/reports/ChartReportPage'), {
  ssr: false,
});

export default function Page() {
  return <ChartReportPage />;
}
