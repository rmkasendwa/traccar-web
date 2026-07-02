import dynamic from 'next/dynamic';

const CommandsPage = dynamic(() => import('@/features/commands/pages/CommandsPage'));

export default function Page() {
  return <CommandsPage />;
}
