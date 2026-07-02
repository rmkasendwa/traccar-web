import dynamic from 'next/dynamic';

const AnnouncementPage = dynamic(() => import('@/features/broadcast/pages/AnnouncementPage'));

export default function Page() {
  return <AnnouncementPage />;
}
