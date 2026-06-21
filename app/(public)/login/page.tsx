import AuthShell from '@/components/auth/AuthShell';
import PasswordInput from '@/components/auth/PasswordInput';
import { applyResponseCookies, fetchFromRequestOrigin } from '@/lib/serverFetch';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type LoginPageProps = {
  searchParams: Promise<{ error?: string; totp?: string; email?: string; created?: string }>;
};

const getServerConfig = async () => {
  try {
    const response = await fetchFromRequestOrigin('/api/server');
    return response?.ok ? response.json() : null;
  } catch {
    return null;
  }
};

const login = async (formData: FormData) => {
  'use server';

  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const code = String(formData.get('code') || '').trim();

  if (!email || !password) {
    redirect('/login?error=missing');
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
    redirect(`/login?totp=1&email=${encodeURIComponent(email)}`);
  }

  redirect('/login?error=credentials');
};

export default async function Page({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const server = await getServerConfig();
  const showTotp = params.totp === '1';
  const error = params.error;
  const openIdEnabled = Boolean(server?.openIdEnabled);
  const openIdForced = Boolean(server?.openIdEnabled && server?.openIdForce);
  const inputClass =
    'min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800';

  return (
    <AuthShell title="Welcome back" subtitle="Sign in with your account credentials to continue.">
      <div className="flex flex-col gap-4">
        {params.created && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Account created. You can sign in now.
          </p>
        )}

        {!openIdForced && (
          <form action={login} className="flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              <span>
                Email or username <span className="font-bold text-red-600">*</span>
              </span>
              <input
                className={inputClass}
                name="email"
                autoComplete="email"
                defaultValue={params.email || ''}
                placeholder="john@example.com"
                required
              />
              <span className="text-xs text-slate-500">
                Use the email address or username for your account.
              </span>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-600">
              <span className="flex items-center justify-between">
                <span>
                  Password <span className="font-bold text-red-600">*</span>
                </span>
                <Link
                  className="text-xs font-semibold text-blue-900 hover:underline"
                  href="/reset-password"
                >
                  Forgot your password?
                </Link>
              </span>
              <PasswordInput
                className={inputClass}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
              />
            </label>

            {showTotp && (
              <label className="flex flex-col gap-1 text-sm text-slate-600">
                <span>
                  Verification code <span className="font-bold text-red-600">*</span>
                </span>
                <input
                  className={inputClass}
                  name="code"
                  inputMode="numeric"
                  placeholder="Enter your verification code"
                  required
                />
                <span className="text-xs text-slate-500">
                  Enter the current code from your authenticator app.
                </span>
              </label>
            )}

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                {error === 'missing'
                  ? 'Please enter your email or username and password.'
                  : 'Invalid username or password. Check your details and try again.'}
              </p>
            )}

            <button className="min-h-11 rounded-md bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">
              Sign in
            </button>
          </form>
        )}

        {openIdEnabled && (
          <a
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            href="/api/session/openid/auth"
          >
            Sign in with OpenID
          </a>
        )}

        {!openIdForced && (
          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link className="font-semibold text-blue-900 hover:underline" href="/register">
              Register
            </Link>
          </p>
        )}
      </div>
    </AuthShell>
  );
}
