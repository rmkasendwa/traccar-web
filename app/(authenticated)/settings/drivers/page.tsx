'use client';

import dynamic from 'next/dynamic';

const DriversPage = dynamic(() => import('@/features/drivers/pages/DriversPage'), {
  ssr: false,
});

export default function Page() {
  return <DriversPage />;
}
