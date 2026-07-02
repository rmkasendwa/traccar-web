import dynamic from 'next/dynamic';

const GroupsPage = dynamic(() => import('@/features/groups/pages/GroupsPage'));

export default function Page() {
  return <GroupsPage />;
}
