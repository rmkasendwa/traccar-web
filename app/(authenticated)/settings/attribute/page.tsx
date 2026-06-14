'use client';

import dynamic from 'next/dynamic';

const ComputedAttributePage = dynamic(
  () => import('@/features/attributes/pages/ComputedAttributePage'),
  {
    ssr: false,
  },
);

export default function Page() {
  return <ComputedAttributePage />;
}
