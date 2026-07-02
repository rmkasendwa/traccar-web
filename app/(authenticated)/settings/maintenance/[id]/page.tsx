import dynamic from 'next/dynamic';

const MaintenancePage = dynamic(() => import('@/features/maintenance/pages/MaintenancePage'));

export default function Page() {
  return <MaintenancePage />;
}
