import dynamic from 'next/dynamic';

const GroupConnectionsPage = dynamic(() => import('@/features/groups/pages/GroupConnectionsPage'));

export default function Page() {
  return <GroupConnectionsPage />;
}
