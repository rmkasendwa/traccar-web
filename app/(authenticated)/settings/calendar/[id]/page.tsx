import dynamic from 'next/dynamic';

const CalendarPage = dynamic(() => import('@/features/calendar/pages/CalendarPage'));

export default function Page() {
  return <CalendarPage />;
}
