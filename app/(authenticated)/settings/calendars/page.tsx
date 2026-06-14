'use client';

import dynamic from 'next/dynamic';

const CalendarsPage = dynamic(() => import('@/features/calendar/pages/CalendarsPage'), {
  ssr: false,
});

export default function Page() {
  return <CalendarsPage />;
}
