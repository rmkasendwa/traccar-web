import dynamic from 'next/dynamic';

const ComputedAttributePage = dynamic(
  () => import('@/features/attributes/pages/ComputedAttributePage'),
);

export default function Page() {
  return <ComputedAttributePage />;
}
