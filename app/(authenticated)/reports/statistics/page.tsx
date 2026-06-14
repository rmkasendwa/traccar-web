'use client';

import dynamic from 'next/dynamic';

const StatisticsPage = dynamic(() => import('@/reports/StatisticsPage'), {
  ssr: false,
});

export default function Page() {
  return <StatisticsPage />;
}
