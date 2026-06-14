'use client';

import dynamic from 'next/dynamic';

const GroupsPage = dynamic(() => import('@/settings/GroupsPage'), {
  ssr: false,
});

export default function Page() {
  return <GroupsPage />;
}
