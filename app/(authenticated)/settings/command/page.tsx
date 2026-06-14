'use client';

import dynamic from 'next/dynamic';

const CommandPage = dynamic(() => import('@/settings/CommandPage'), {
  ssr: false,
});

export default function Page() {
  return <CommandPage />;
}
