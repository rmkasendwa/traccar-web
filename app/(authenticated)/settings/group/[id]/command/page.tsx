'use client';

import dynamic from 'next/dynamic';

const CommandGroupPage = dynamic(() => import('@/settings/CommandGroupPage'), {
  ssr: false,
});

export default function Page() {
  return <CommandGroupPage />;
}
