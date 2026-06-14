'use client';

import dynamic from 'next/dynamic';

const RegisterPage = dynamic(() => import('@/login/RegisterPage'), {
  ssr: false,
});

export default function Page() {
  return <RegisterPage />;
}
