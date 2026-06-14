'use client';

import dynamic from 'next/dynamic';

const GroupConnectionsPage = dynamic(() => import('@/features/groups/pages/GroupConnectionsPage'), {
  ssr: false,
});

export default function Page() {
  return <GroupConnectionsPage />;
}
