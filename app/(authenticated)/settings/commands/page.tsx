'use client';

import dynamic from 'next/dynamic';

const CommandsPage = dynamic(() => import('@/features/commands/pages/CommandsPage'), {
  ssr: false,
});

export default function Page() {
  return <CommandsPage />;
}
