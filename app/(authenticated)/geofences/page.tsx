'use client';

import dynamic from 'next/dynamic';

const GeofencesPage = dynamic(() => import('@/features/geofences/pages/GeofencesPage'), {
  ssr: false,
});

export default function Page() {
  return <GeofencesPage />;
}
