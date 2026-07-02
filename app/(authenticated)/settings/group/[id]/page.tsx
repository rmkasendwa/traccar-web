import dynamic from 'next/dynamic';

const GroupPage = dynamic(() => import('@/features/groups/pages/GroupPage'));

export default function Page() {
  return <GroupPage />;
}
