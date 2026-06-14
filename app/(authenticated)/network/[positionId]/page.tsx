'use client';

import dynamic from 'next/dynamic';

const NetworkPage = dynamic(() => import('@/other/NetworkPage'), {
  ssr: false,
});

export default function Page() {
  return <NetworkPage />;
}
