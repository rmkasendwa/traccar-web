import dynamic from 'next/dynamic';

const NotificationsPage = dynamic(() => import('@/features/notifications/pages/NotificationsPage'));

export default function Page() {
  return <NotificationsPage />;
}
