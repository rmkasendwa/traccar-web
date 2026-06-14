'use client';

import dynamic from 'next/dynamic';

const PositionPage = dynamic(() => import('@/features/positions/pages/PositionPage'), {
  ssr: false,
});

export default function Page() {
  return <PositionPage />;
}
