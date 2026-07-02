import dynamic from 'next/dynamic';

const DriverPage = dynamic(() => import('@/features/drivers/pages/DriverPage'));

export default function Page() {
  return <DriverPage />;
}
