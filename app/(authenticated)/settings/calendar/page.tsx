'use client';

import dynamic from 'next/dynamic';

const CalendarPage = dynamic(() => import('@/settings/CalendarPage'), {
  ssr: false,
});

export default function Page() {
  return <CalendarPage />;
}
