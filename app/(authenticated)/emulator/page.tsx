'use client';

import dynamic from 'next/dynamic';

const EmulatorPage = dynamic(() => import('@/features/emulator/pages/EmulatorPage'), {
  ssr: false,
});

export default function Page() {
  return <EmulatorPage />;
}
