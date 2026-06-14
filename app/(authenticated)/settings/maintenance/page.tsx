'use client';

import dynamic from 'next/dynamic';

const MaintenancePage = dynamic(() => import('@/features/maintenance/pages/MaintenancePage'), {
  ssr: false,
});

export default function Page() {
  return <MaintenancePage />;
}
