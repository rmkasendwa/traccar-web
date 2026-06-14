'use client';

import dynamic from 'next/dynamic';

const AnnouncementPage = dynamic(() => import('@/settings/AnnouncementPage'), {
  ssr: false,
});

export default function Page() {
  return <AnnouncementPage />;
}
