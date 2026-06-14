'use client';

import dynamic from 'next/dynamic';

const GroupsPage = dynamic(() => import('@/features/groups/pages/GroupsPage'), {
  ssr: false,
});

export default function Page() {
  return <GroupsPage />;
}
