import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';
import type { AuthFormState } from '@/components/auth/formState';
import { applyResponseCookies, fetchFromRequestOrigin } from '@/lib/serverFetch';
import { redirect } from 'next/navigation';

type LoginPageProps = {
  searchParams: Promise<{ totp?: string; email?: string; created?: string; updated?: string }>;
};

const getServerConfig = async () => {
  try {
    const response = await fetchFromRequestOrigin('/api/server');
    return response?.ok ? response.json() : null;
  } catch {
    return null;
  }
};

const login = async (_state: AuthFormState, formData: FormData): Promise<AuthFormState> => {
  'use server';

  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const code = String(formData.get('code') || '').trim();

  if (!email || !password) {
    return {
      errors: {
        ...(email ? {} : { email: 'Email or username is required.' }),
        ...(password ? {} : { password: 'Password is required.' }),
      },
      values: { email },
    };
  }

  const body = new URLSearchParams({ email, password });
  if (code) {
    body.set('code', code);
  }

  const response = await fetchFromRequestOrigin('/api/session', { method: 'POST', body });
  if (response?.ok) {
    await applyResponseCookies(response);
    redirect('/');
  }

  if (response?.status === 401 && response.headers.get('WWW-Authenticate') === 'TOTP') {
    return {
      message: 'Enter your verification code to continue.',
      values: { email },
      totp: true,
    };
  }

  return {
    message: 'Invalid username or password. Check your details and try again.',
    values: { email },
  };
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const server = await getServerConfig();
  const openIdEnabled = Boolean(server?.openIdEnabled);
  const openIdForced = Boolean(server?.openIdEnabled && server?.openIdForce);
  const initialState: AuthFormState = {
    errors: {},
    values: { email: params.email || '' },
    message: params.created
      ? 'Account created. You can sign in now.'
      : params.updated
        ? 'Password updated. You can sign in now.'
        : undefined,
    status: params.created || params.updated ? 'success' : undefined,
    totp: params.totp === '1',
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in with your account credentials to continue.">
      <LoginForm
        action={login}
        initialState={initialState}
        openIdEnabled={openIdEnabled}
        openIdForced={openIdForced}
      />
    </AuthShell>
  );
}
