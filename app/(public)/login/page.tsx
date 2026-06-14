'use client';

import dynamic from 'next/dynamic';

const LoginPage = dynamic(() => import('@/features/auth/LoginPage'), {
  ssr: false,
});

export default function Page() {
  return <LoginPage />;
}
