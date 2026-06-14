'use client';

import dynamic from 'next/dynamic';

const UserPage = dynamic(() => import('@/features/users/pages/UserPage'), {
  ssr: false,
});

export default function Page() {
  return <UserPage />;
}
