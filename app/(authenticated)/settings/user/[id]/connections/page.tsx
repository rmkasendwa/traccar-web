'use client';

import dynamic from 'next/dynamic';

const UserConnectionsPage = dynamic(() => import('@/settings/UserConnectionsPage'), {
  ssr: false,
});

export default function Page() {
  return <UserConnectionsPage />;
}
