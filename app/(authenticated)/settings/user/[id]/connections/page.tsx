import dynamic from 'next/dynamic';

const UserConnectionsPage = dynamic(() => import('@/features/users/pages/UserConnectionsPage'));

export default function Page() {
  return <UserConnectionsPage />;
}
