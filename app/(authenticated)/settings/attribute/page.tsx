'use client';

import dynamic from 'next/dynamic';

const ComputedAttributePage = dynamic(() => import('@/settings/ComputedAttributePage'), {
  ssr: false,
});

export default function Page() {
  return <ComputedAttributePage />;
}
