'use client';

import dynamic from 'next/dynamic';

const DevicePage = dynamic(() => import('@/features/devices/pages/DevicePage'), {
  ssr: false,
});

export default function Page() {
  return <DevicePage />;
}
