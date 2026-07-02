import dynamic from 'next/dynamic';

const UserPage = dynamic(() => import('@/features/users/pages/UserPage'));

export default function Page() {
  return <UserPage />;
}
