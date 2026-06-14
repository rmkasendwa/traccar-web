'use client';

import dynamic from 'next/dynamic';

const PositionsReportPage = dynamic(() => import('@/features/reports/PositionsReportPage'), {
  ssr: false,
});

export default function Page() {
  return <PositionsReportPage />;
}
