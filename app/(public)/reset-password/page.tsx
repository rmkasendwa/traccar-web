import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import PasswordInput from '@/components/auth/PasswordInput';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';

type ResetPasswordPageProps = {
  searchParams: Promise<{
    passwordReset?: string;
    error?: string;
    sent?: string;
    updated?: string;
  }>;
};

const resetPassword = async (formData: FormData) => {
  'use server';

  const token = String(formData.get('token') || '');
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!token) {
    if (!/(.+)@(.+)\.(.{2,})/.test(email)) {
      redirect('/reset-password?error=email');
    }
    const response = await fetchFromRequestOrigin('/api/password/reset', {
      method: 'POST',
      body: new URLSearchParams({ email }),
    });
    redirect(response?.ok ? '/reset-password?sent=1' : '/reset-password?error=server');
  }

  if (password.length < 8) {
    redirect(`/reset-password?passwordReset=${encodeURIComponent(token)}&error=password`);
  }
  if (password !== confirmPassword) {
    redirect(`/reset-password?passwordReset=${encodeURIComponent(token)}&error=match`);
  }

  const response = await fetchFromRequestOrigin('/api/password/update', {
    method: 'POST',
    body: new URLSearchParams({ token, password }),
  });

  redirect(
    response?.ok
      ? '/login?updated=1'
      : `/reset-password?passwordReset=${encodeURIComponent(token)}&error=server`,
  );
};

const errorMessage = (error?: string) =>
  ({
    email: 'Please enter your email address.',
    password: 'Password must contain at least 8 characters.',
    match: 'Passwords must match.',
    server: 'Unable to complete the password reset. The link may have expired.',
  })[error || ''];

export default async function Page({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.passwordReset || '';
  const hasToken = Boolean(token);
  const inputClass =
    'min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800';

  return (
    <AuthShell
      title={hasToken ? 'Create a new password' : 'Reset password'}
      subtitle={
        hasToken
          ? 'Choose a new password for your account.'
          : 'Enter your email address and we will send you instructions to reset your password.'
      }
    >
      <form action={resetPassword} className="flex flex-col gap-4" noValidate>
        {params.sent && (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Password reset instructions have been sent.
          </p>
        )}
        {params.error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            {errorMessage(params.error)}
          </p>
        )}

        <input type="hidden" name="token" value={token} />

        {!hasToken ? (
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            <span>
              Email <span className="font-bold text-red-600">*</span>
            </span>
            <input className={inputClass} name="email" type="email" autoComplete="email" required />
            <span className="text-xs text-slate-500">
              Used to find your account and send recovery instructions.
            </span>
          </label>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              <span>
                New password <span className="font-bold text-red-600">*</span>
              </span>
              <PasswordInput className={inputClass} name="password" autoComplete="new-password" />
              <span className="text-xs text-slate-500">Must contain at least 8 characters.</span>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-600">
              <span>
                Confirm password <span className="font-bold text-red-600">*</span>
              </span>
              <PasswordInput
                className={inputClass}
                name="confirmPassword"
                autoComplete="new-password"
              />
            </label>
          </>
        )}

        <button className="min-h-11 rounded-md bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">
          Reset password
        </button>

        <p className="text-center text-sm">
          <Link className="font-semibold text-blue-900 hover:underline" href="/login">
            Return to Login
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
