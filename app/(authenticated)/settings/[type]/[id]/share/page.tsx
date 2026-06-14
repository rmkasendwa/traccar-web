'use client';

import dynamic from 'next/dynamic';

const SharePage = dynamic(() => import('@/settings/SharePage'), {
  ssr: false,
});

export default function Page() {
  return <SharePage />;
}
