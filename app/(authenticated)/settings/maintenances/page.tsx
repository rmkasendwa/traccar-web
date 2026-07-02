import dynamic from 'next/dynamic';

const MaintenancesPage = dynamic(() => import('@/features/maintenance/pages/MaintenancesPage'));

export default function Page() {
  return <MaintenancesPage />;
}
