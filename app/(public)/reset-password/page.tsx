'use client';

import dynamic from 'next/dynamic';

const ResetPasswordPage = dynamic(() => import('@/features/auth/ResetPasswordPage'), {
  ssr: false,
});

export default function Page() {
  return <ResetPasswordPage />;
}
