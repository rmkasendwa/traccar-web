import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const register = async (formData: FormData) => {
  'use server';

  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!name || !email || !password || !confirmPassword) {
    redirect('/register?error=missing');
  }
  if (!/(.+)@(.+)\.(.{2,})/.test(email)) {
    redirect('/register?error=email');
  }
  if (password.length < 8) {
    redirect('/register?error=password');
  }
  if (password !== confirmPassword) {
    redirect('/register?error=match');
  }

  const response = await fetchFromRequestOrigin('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response?.ok) {
    redirect('/register?error=server');
  }

  redirect('/login?created=1');
};

const errorMessage = (error?: string) =>
  ({
    missing: 'Please complete every required field.',
    email: 'Please enter a valid email address.',
    password: 'Password must contain at least 8 characters.',
    match: 'Passwords must match.',
    server: 'Registration failed. Please check your details and try again.',
  })[error || ''];

export default async function Page({ searchParams }: RegisterPageProps) {
  const { error } = await searchParams;

  return (
    <AuthShell
      title="Register"
      subtitle="Create your account with a name, email address, and secure password."
    >
      <form action={register} className="flex flex-col gap-4" noValidate>
        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            {errorMessage(error)}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Name <span className="font-bold text-red-600">*</span>
          <input
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            name="name"
            autoComplete="name"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Email <span className="font-bold text-red-600">*</span>
          <input
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <span className="text-xs text-slate-500">
            Used for account sign in and password recovery.
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Password <span className="font-bold text-red-600">*</span>
          <input
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <span className="text-xs text-slate-500">Must contain at least 8 characters.</span>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Confirm password <span className="font-bold text-red-600">*</span>
          <input
            className="min-h-11 rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
        </label>

        <button className="min-h-11 rounded-md bg-emerald-700 px-4 font-medium text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2">
          Register
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-blue-900 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
