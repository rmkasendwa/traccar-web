'use client';

import dynamic from 'next/dynamic';

const UsersPage = dynamic(() => import('@/features/users/pages/UsersPage'), {
  ssr: false,
});

export default function Page() {
  return <UsersPage />;
}
