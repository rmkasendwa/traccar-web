'use client';

import dynamic from 'next/dynamic';

const PreferencesPage = dynamic(() => import('@/settings/PreferencesPage'), {
  ssr: false,
});

export default function Page() {
  return <PreferencesPage />;
}
