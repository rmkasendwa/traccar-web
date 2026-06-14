'use client';

import dynamic from 'next/dynamic';

const LoginPage = dynamic(() => import('@/login/LoginPage'), {
  ssr: false,
});

export default function Page() {
  return <LoginPage />;
}
