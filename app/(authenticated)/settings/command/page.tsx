import dynamic from 'next/dynamic';

const CommandPage = dynamic(() => import('@/features/commands/pages/CommandPage'));

export default function Page() {
  return <CommandPage />;
}
