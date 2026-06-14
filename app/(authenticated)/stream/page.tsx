'use client';

import dynamic from 'next/dynamic';

const StreamPage = dynamic(() => import('@/features/stream/pages/StreamPage'), {
  ssr: false,
});

export default function Page() {
  return <StreamPage />;
}
