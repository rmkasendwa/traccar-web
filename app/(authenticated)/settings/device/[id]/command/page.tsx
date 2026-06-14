'use client';

import dynamic from 'next/dynamic';

const CommandDevicePage = dynamic(() => import('@/features/commands/pages/CommandDevicePage'), {
  ssr: false,
});

export default function Page() {
  return <CommandDevicePage />;
}
