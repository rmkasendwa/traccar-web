'use client';

import dynamic from 'next/dynamic';

const PositionPage = dynamic(() => import('@/other/PositionPage'), {
  ssr: false,
});

export default function Page() {
  return <PositionPage />;
}
