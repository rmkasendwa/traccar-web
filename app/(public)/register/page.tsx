'use client';

import dynamic from 'next/dynamic';

const RegisterPage = dynamic(() => import('@/features/auth/RegisterPage'), {
  ssr: false,
});

export default function Page() {
  return <RegisterPage />;
}
