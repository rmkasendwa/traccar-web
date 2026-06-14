'use client';

import dynamic from 'next/dynamic';

const MainPage = dynamic(() => import('@/features/tracking/MainPage'), {
  ssr: false,
});

export default function Page() {
  return <MainPage />;
}
