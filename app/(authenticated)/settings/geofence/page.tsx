'use client';

import dynamic from 'next/dynamic';

const GeofencePage = dynamic(() => import('@/features/geofences/pages/GeofencePage'), {
  ssr: false,
});

export default function Page() {
  return <GeofencePage />;
}
