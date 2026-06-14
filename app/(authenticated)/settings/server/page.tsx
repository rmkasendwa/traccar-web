'use client';

import dynamic from 'next/dynamic';

const ServerPage = dynamic(() => import('@/features/settings/pages/ServerPage'), {
  ssr: false,
});

export default function Page() {
  return <ServerPage />;
}
