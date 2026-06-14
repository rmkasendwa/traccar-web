'use client';

import dynamic from 'next/dynamic';

const GeofencesPage = dynamic(() => import('@/other/GeofencesPage'), {
  ssr: false,
});

export default function Page() {
  return <GeofencesPage />;
}
