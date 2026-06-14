'use client';

import dynamic from 'next/dynamic';

const GeofencePage = dynamic(() => import('@/settings/GeofencePage'), {
  ssr: false,
});

export default function Page() {
  return <GeofencePage />;
}
