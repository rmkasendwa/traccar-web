import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';

const redirectAuthenticatedUsers = async () => {
  let authenticated = false;
  try {
    const response = await fetchFromRequestOrigin('/api/session');
    authenticated = Boolean(response?.ok);
  } catch {
    // Treat session lookup failures as logged out so recovery/login remains reachable.
  }
  if (authenticated) {
    redirect('/');
  }
};

export default async function PublicLayout({ children }: { children: ReactNode }) {
  await redirectAuthenticatedUsers();
  return children;
}
