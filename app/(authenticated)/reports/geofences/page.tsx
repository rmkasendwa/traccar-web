'use client';

import dynamic from 'next/dynamic';

const GeofenceReportPage = dynamic(() => import('@/reports/GeofenceReportPage'), {
  ssr: false,
});

export default function Page() {
  return <GeofenceReportPage />;
}
