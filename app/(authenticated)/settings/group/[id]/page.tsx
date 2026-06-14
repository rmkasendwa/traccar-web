'use client';

import dynamic from 'next/dynamic';

const GroupPage = dynamic(() => import('@/settings/GroupPage'), {
  ssr: false,
});

export default function Page() {
  return <GroupPage />;
}
