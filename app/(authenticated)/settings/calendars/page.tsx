'use client';

import dynamic from 'next/dynamic';

const CalendarsPage = dynamic(() => import('@/settings/CalendarsPage'), {
  ssr: false,
});

export default function Page() {
  return <CalendarsPage />;
}
