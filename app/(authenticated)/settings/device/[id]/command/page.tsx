import dynamic from 'next/dynamic';

const CommandDevicePage = dynamic(() => import('@/features/commands/pages/CommandDevicePage'));

export default function Page() {
  return <CommandDevicePage />;
}
