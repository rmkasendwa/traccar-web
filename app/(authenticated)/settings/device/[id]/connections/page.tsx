'use client';

import dynamic from 'next/dynamic';

const DeviceConnectionsPage = dynamic(() => import('@/settings/DeviceConnectionsPage'), {
  ssr: false,
});

export default function Page() {
  return <DeviceConnectionsPage />;
}
