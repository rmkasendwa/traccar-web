'use client';

import dynamic from 'next/dynamic';

const GroupPage = dynamic(() => import('@/features/groups/pages/GroupPage'), {
  ssr: false,
});

export default function Page() {
  return <GroupPage />;
}
