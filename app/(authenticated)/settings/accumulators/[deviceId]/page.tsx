import dynamic from 'next/dynamic';

const AccumulatorsPage = dynamic(() => import('@/features/devices/pages/AccumulatorsPage'));

export default function Page() {
  return <AccumulatorsPage />;
}
