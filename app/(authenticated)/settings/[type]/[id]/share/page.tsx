'use client';

import dynamic from 'next/dynamic';

const SharePage = dynamic(() => import('@/features/users/pages/SharePage'), {
  ssr: false,
});

export default function Page() {
  return <SharePage />;
}
