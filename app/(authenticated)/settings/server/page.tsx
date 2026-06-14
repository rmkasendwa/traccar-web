'use client';

import dynamic from 'next/dynamic';

const ServerPage = dynamic(() => import('@/settings/ServerPage'), {
  ssr: false,
});

export default function Page() {
  return <ServerPage />;
}
