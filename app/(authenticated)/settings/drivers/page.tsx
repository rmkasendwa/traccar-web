'use client';

import dynamic from 'next/dynamic';

const DriversPage = dynamic(() => import('@/settings/DriversPage'), {
  ssr: false,
});

export default function Page() {
  return <DriversPage />;
}
