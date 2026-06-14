'use client';

import dynamic from 'next/dynamic';

const CommandDevicePage = dynamic(() => import('@/settings/CommandDevicePage'), {
  ssr: false,
});

export default function Page() {
  return <CommandDevicePage />;
}
