'use client';

import dynamic from 'next/dynamic';

const NotificationPage = dynamic(() => import('@/settings/NotificationPage'), {
  ssr: false,
});

export default function Page() {
  return <NotificationPage />;
}
