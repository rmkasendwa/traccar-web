'use client';

import dynamic from 'next/dynamic';

const EventPage = dynamic(() => import('@/features/events/pages/EventPage'), {
  ssr: false,
});

export default function Page() {
  return <EventPage />;
}
