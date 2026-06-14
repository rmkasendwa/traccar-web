'use client';

import dynamic from 'next/dynamic';

const ComputedAttributesPage = dynamic(
  () => import('@/features/attributes/pages/ComputedAttributesPage'),
  {
    ssr: false,
  },
);

export default function Page() {
  return <ComputedAttributesPage />;
}
