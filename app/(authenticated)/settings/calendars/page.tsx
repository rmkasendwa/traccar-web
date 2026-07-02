import dynamic from 'next/dynamic';

const CalendarsPage = dynamic(() => import('@/features/calendar/pages/CalendarsPage'));

export default function Page() {
  return <CalendarsPage />;
}
