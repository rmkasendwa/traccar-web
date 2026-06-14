'use client';

import dynamic from 'next/dynamic';

const StreamPage = dynamic(() => import('@/other/StreamPage'), {
  ssr: false,
});

export default function Page() {
  return <StreamPage />;
}
