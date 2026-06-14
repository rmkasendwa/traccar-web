'use client';

import dynamic from 'next/dynamic';

const MaintenancesPage = dynamic(() => import('@/features/maintenance/pages/MaintenancesPage'), {
  ssr: false,
});

export default function Page() {
  return <MaintenancesPage />;
}
