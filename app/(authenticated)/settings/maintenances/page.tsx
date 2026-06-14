'use client';

import dynamic from 'next/dynamic';

const MaintenancesPage = dynamic(() => import('@/settings/MaintenancesPage'), {
  ssr: false,
});

export default function Page() {
  return <MaintenancesPage />;
}
