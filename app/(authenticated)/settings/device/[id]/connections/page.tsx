'use client';

import dynamic from 'next/dynamic';

const DeviceConnectionsPage = dynamic(
  () => import('@/features/devices/pages/DeviceConnectionsPage'),
  {
    ssr: false,
  },
);

export default function Page() {
  return <DeviceConnectionsPage />;
}
