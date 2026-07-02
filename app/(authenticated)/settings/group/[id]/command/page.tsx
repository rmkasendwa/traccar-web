import dynamic from 'next/dynamic';

const CommandGroupPage = dynamic(() => import('@/features/commands/pages/CommandGroupPage'));

export default function Page() {
  return <CommandGroupPage />;
}
