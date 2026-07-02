import dynamic from 'next/dynamic';

const DeviceConnectionsPage = dynamic(
  () => import('@/features/devices/pages/DeviceConnectionsPage'),
);

export default function Page() {
  return <DeviceConnectionsPage />;
}
