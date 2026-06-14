'use client';

import dynamic from 'next/dynamic';

const AnnouncementPage = dynamic(() => import('@/features/broadcast/pages/AnnouncementPage'), {
  ssr: false,
});

export default function Page() {
  return <AnnouncementPage />;
}
