import MainPageClient from '@/app/(authenticated)/MainPageClient';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';

const readJson = async (path: string) => {
  const response = await fetchFromRequestOrigin(path);
  if (!response?.ok) {
    throw new Error(`Unable to load ${path}`);
  }
  return response.json();
};

export default async function Page() {
  const [devices, positions] = await Promise.all([
    readJson('/api/devices'),
    readJson('/api/positions').catch(() => []),
  ]);

  return <MainPageClient initialDevices={devices} initialPositions={positions} />;
}
