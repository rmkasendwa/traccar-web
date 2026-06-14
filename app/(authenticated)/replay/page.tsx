'use client';

import dynamic from 'next/dynamic';

const ReplayPage = dynamic(() => import('@/other/ReplayPage'), {
  ssr: false,
});

export default function Page() {
  return <ReplayPage />;
}
