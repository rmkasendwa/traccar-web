'use client';

import dynamic from 'next/dynamic';

const CommandPage = dynamic(() => import('@/features/commands/pages/CommandPage'), {
  ssr: false,
});

export default function Page() {
  return <CommandPage />;
}
