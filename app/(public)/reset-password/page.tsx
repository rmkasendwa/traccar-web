'use client';

import dynamic from 'next/dynamic';

const ResetPasswordPage = dynamic(() => import('@/login/ResetPasswordPage'), {
  ssr: false,
});

export default function Page() {
  return <ResetPasswordPage />;
}
