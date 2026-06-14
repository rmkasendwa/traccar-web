'use client';

import dynamic from 'next/dynamic';

const AuditPage = dynamic(() => import('@/features/reports/AuditPage'), {
  ssr: false,
});

export default function Page() {
  return <AuditPage />;
}
