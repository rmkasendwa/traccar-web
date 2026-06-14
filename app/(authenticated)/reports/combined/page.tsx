'use client';

import dynamic from 'next/dynamic';

const CombinedReportPage = dynamic(() => import('@/reports/CombinedReportPage'), {
  ssr: false,
});

export default function Page() {
  return <CombinedReportPage />;
}
