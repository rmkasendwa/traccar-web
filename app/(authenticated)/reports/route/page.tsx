'use client';

import dynamic from 'next/dynamic';

const PositionsReportPage = dynamic(() => import('@/reports/PositionsReportPage'), {
  ssr: false,
});

export default function Page() {
  return <PositionsReportPage />;
}
