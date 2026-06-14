'use client';

import dynamic from 'next/dynamic';

const AccumulatorsPage = dynamic(() => import('@/settings/AccumulatorsPage'), {
  ssr: false,
});

export default function Page() {
  return <AccumulatorsPage />;
}
