'use client';

import dynamic from 'next/dynamic';

const UserPage = dynamic(() => import('@/settings/UserPage'), {
  ssr: false,
});

export default function Page() {
  return <UserPage />;
}
