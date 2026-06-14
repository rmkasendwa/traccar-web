'use client';

import dynamic from 'next/dynamic';

const ReplayPage = dynamic(() => import('@/features/replay/pages/ReplayPage'), {
  ssr: false,
});

export default function Page() {
  return <ReplayPage />;
}
