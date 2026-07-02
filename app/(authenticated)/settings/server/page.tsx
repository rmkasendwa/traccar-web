import dynamic from 'next/dynamic';

const ServerPage = dynamic(() => import('@/features/settings/pages/ServerPage'));

export default function Page() {
  return <ServerPage />;
}
