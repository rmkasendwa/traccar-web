'use client';

import dynamic from 'next/dynamic';

const UsersPage = dynamic(() => import('@/settings/UsersPage'), {
  ssr: false,
});

export default function Page() {
  return <UsersPage />;
}
