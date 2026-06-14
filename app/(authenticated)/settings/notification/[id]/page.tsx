'use client';

import dynamic from 'next/dynamic';

const NotificationPage = dynamic(() => import('@/features/notifications/pages/NotificationPage'), {
  ssr: false,
});

export default function Page() {
  return <NotificationPage />;
}
