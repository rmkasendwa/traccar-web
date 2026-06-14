'use client';

import dynamic from 'next/dynamic';

const EmulatorPage = dynamic(() => import('@/other/EmulatorPage'), {
  ssr: false,
});

export default function Page() {
  return <EmulatorPage />;
}
