import AuthShell from '@/components/auth/AuthShell';
import RegisterForm from '@/components/auth/RegisterForm';
import type { AuthFormState } from '@/components/auth/formState';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';
import { routes } from '@/lib/routes';
import { redirect } from 'next/navigation';

const register = async (_state: AuthFormState, formData: FormData): Promise<AuthFormState> => {
  'use server';

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!name || !email || !password || !confirmPassword) {
    return {
      message: 'Please complete every required field.',
      values: { name, email },
    };
  }
  if (!/(.+)@(.+)\.(.{2,})/.test(email)) {
    return { errors: { email: 'Enter a valid email address.' }, values: { name, email } };
  }
  if (password.length < 8) {
    return {
      errors: { password: 'Password must contain at least 8 characters.' },
      values: { name, email },
    };
  }
  if (password !== confirmPassword) {
    return { errors: { confirmPassword: 'Passwords must match.' }, values: { name, email } };
  }

  const response = await fetchFromRequestOrigin('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response?.ok) {
    return {
      message: 'Registration failed. Please check your details and try again.',
      values: { name, email },
    };
  }

  redirect(`${routes.login}?created=1`);
};

export default function Page() {
  return (
    <AuthShell titleKey="loginRegister">
      <RegisterForm action={register} />
    </AuthShell>
  );
}
