import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { routes } from '@/lib/routes';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';

export default async function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const response = await fetchFromRequestOrigin('/api/session');
  if (!response?.ok) {
    redirect(routes.login);
  }

  const user = await response.json();
  return <AppShell initialUser={user}>{children}</AppShell>;
}
