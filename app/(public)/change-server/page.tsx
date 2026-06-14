'use client';

import dynamic from 'next/dynamic';

const ChangeServerPage = dynamic(() => import('@/login/ChangeServerPage'), {
  ssr: false,
});

export default function Page() {
  return <ChangeServerPage />;
}
