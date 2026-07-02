import dynamic from 'next/dynamic';

const DevicePage = dynamic(() => import('@/features/devices/pages/DevicePage'));

export default function Page() {
  return <DevicePage />;
}
