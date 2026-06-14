'use client';

import dynamic from 'next/dynamic';

const MaintenancePage = dynamic(() => import('@/settings/MaintenancePage'), {
  ssr: false,
});

export default function Page() {
  return <MaintenancePage />;
}
