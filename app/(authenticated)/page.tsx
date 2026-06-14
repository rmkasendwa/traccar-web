'use client';

import dynamic from 'next/dynamic';

const MainPage = dynamic(() => import('@/main/MainPage'), {
  ssr: false,
});

export default function Page() {
  return <MainPage />;
}
