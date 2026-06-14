'use client';

import dynamic from 'next/dynamic';

const DevicesPage = dynamic(() => import('@/features/devices/pages/DevicesPage'), {
  ssr: false,
});

export default function Page() {
  return <DevicesPage />;
}
