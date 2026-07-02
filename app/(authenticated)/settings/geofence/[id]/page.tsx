import dynamic from 'next/dynamic';

const GeofencePage = dynamic(() => import('@/features/geofences/pages/GeofencePage'));

export default function Page() {
  return <GeofencePage />;
}
