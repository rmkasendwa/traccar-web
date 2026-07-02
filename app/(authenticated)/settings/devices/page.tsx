import dynamic from 'next/dynamic';

const DevicesPage = dynamic(() => import('@/features/devices/pages/DevicesPage'));

export default function Page() {
  return <DevicesPage />;
}
