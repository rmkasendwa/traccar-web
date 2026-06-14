'use client';

import dynamic from 'next/dynamic';

const AccumulatorsPage = dynamic(() => import('@/features/devices/pages/AccumulatorsPage'), {
  ssr: false,
});

export default function Page() {
  return <AccumulatorsPage />;
}
