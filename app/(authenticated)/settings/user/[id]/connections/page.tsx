'use client';

import dynamic from 'next/dynamic';

const UserConnectionsPage = dynamic(() => import('@/features/users/pages/UserConnectionsPage'), {
  ssr: false,
});

export default function Page() {
  return <UserConnectionsPage />;
}
