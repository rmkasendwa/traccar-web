import dynamic from 'next/dynamic';

const PreferencesPage = dynamic(() => import('@/features/settings/pages/PreferencesPage'));

export default function Page() {
  return <PreferencesPage />;
}
