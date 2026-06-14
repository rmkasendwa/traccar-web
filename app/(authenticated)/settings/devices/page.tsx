'use client';

import dynamic from 'next/dynamic';

const DevicesPage = dynamic(() => import('@/settings/DevicesPage'), {
  ssr: false,
});

export default function Page() {
  return <DevicesPage />;
}
