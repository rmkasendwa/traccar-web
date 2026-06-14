'use client';

import dynamic from 'next/dynamic';

const CommandsPage = dynamic(() => import('@/settings/CommandsPage'), {
  ssr: false,
});

export default function Page() {
  return <CommandsPage />;
}
