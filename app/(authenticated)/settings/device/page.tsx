'use client';

import dynamic from 'next/dynamic';

const DevicePage = dynamic(() => import('@/settings/DevicePage'), {
  ssr: false,
});

export default function Page() {
  return <DevicePage />;
}
