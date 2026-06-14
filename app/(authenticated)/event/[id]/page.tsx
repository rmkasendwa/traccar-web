'use client';

import dynamic from 'next/dynamic';

const EventPage = dynamic(() => import('@/other/EventPage'), {
  ssr: false,
});

export default function Page() {
  return <EventPage />;
}
