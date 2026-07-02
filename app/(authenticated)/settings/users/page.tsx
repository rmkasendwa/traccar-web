import dynamic from 'next/dynamic';

const UsersPage = dynamic(() => import('@/features/users/pages/UsersPage'));

export default function Page() {
  return <UsersPage />;
}
