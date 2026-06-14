'use client';

import dynamic from 'next/dynamic';

const NetworkPage = dynamic(() => import('@/features/positions/pages/NetworkPage'), {
  ssr: false,
});

export default function Page() {
  return <NetworkPage />;
}
