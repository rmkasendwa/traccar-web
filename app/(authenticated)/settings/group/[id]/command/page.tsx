'use client';

import dynamic from 'next/dynamic';

const CommandGroupPage = dynamic(() => import('@/features/commands/pages/CommandGroupPage'), {
  ssr: false,
});

export default function Page() {
  return <CommandGroupPage />;
}
