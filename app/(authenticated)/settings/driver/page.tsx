'use client';

import dynamic from 'next/dynamic';

const DriverPage = dynamic(() => import('@/features/drivers/pages/DriverPage'), {
  ssr: false,
});

export default function Page() {
  return <DriverPage />;
}
