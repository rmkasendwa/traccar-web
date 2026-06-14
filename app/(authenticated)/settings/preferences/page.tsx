'use client';

import dynamic from 'next/dynamic';

const PreferencesPage = dynamic(() => import('@/features/settings/pages/PreferencesPage'), {
  ssr: false,
});

export default function Page() {
  return <PreferencesPage />;
}
