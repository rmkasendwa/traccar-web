import dynamic from 'next/dynamic';

const SharePage = dynamic(() => import('@/features/users/pages/SharePage'));

export default function Page() {
  return <SharePage />;
}
