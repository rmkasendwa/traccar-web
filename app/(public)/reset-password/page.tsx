import AuthShell from '@/components/auth/AuthShell';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import type { AuthFormState } from '@/components/auth/formState';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';
import { redirect } from 'next/navigation';

type ResetPasswordPageProps = {
  searchParams: Promise<{ passwordReset?: string }>;
};

const resetPassword = async (_state: AuthFormState, formData: FormData): Promise<AuthFormState> => {
  'use server';

  const token = String(formData.get('token') || '');
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!token) {
    if (!/(.+)@(.+)\.(.{2,})/.test(email)) {
      return { errors: { email: 'Enter a valid email address.' }, values: { email } };
    }
    const response = await fetchFromRequestOrigin('/api/password/reset', {
      method: 'POST',
      body: new URLSearchParams({ email }),
    });
    return response?.ok
      ? { message: 'Password reset instructions have been sent.', values: { email } }
      : {
          message: 'Unable to send reset instructions. Please try again.',
          errors: { email: 'Unable to send reset instructions. Please try again.' },
          values: { email },
        };
  }

  if (password.length < 8) {
    return { errors: { password: 'Password must contain at least 8 characters.' } };
  }
  if (password !== confirmPassword) {
    return { errors: { confirmPassword: 'Passwords must match.' } };
  }

  const response = await fetchFromRequestOrigin('/api/password/update', {
    method: 'POST',
    body: new URLSearchParams({ token, password }),
  });

  if (response?.ok) {
    redirect('/login?updated=1');
  }

  return {
    message: 'Unable to complete the password reset. The link may have expired.',
    errors: { password: 'Unable to complete the password reset. The link may have expired.' },
  };
};

export default async function Page({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.passwordReset || '';
  const hasToken = Boolean(token);

  return (
    <AuthShell
      title={hasToken ? 'Create a new password' : 'Reset password'}
      subtitle={
        hasToken
          ? 'Choose a new password for your account.'
          : 'Enter your email address and we will send you instructions to reset your password.'
      }
    >
      <ResetPasswordForm action={resetPassword} token={token} />
    </AuthShell>
  );
}
