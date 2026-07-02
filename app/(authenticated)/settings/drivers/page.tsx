import dynamic from 'next/dynamic';

const DriversPage = dynamic(() => import('@/features/drivers/pages/DriversPage'));

export default function Page() {
  return <DriversPage />;
}
