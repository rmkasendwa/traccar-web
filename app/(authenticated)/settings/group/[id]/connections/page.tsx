'use client';

import dynamic from 'next/dynamic';

const GroupConnectionsPage = dynamic(() => import('@/settings/GroupConnectionsPage'), {
  ssr: false,
});

export default function Page() {
  return <GroupConnectionsPage />;
}
