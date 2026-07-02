import dynamic from 'next/dynamic';

const NotificationPage = dynamic(() => import('@/features/notifications/pages/NotificationPage'));

export default function Page() {
  return <NotificationPage />;
}
