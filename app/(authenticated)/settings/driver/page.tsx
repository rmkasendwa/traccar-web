'use client';

import dynamic from 'next/dynamic';

const DriverPage = dynamic(() => import('@/settings/DriverPage'), {
  ssr: false,
});

export default function Page() {
  return <DriverPage />;
}
