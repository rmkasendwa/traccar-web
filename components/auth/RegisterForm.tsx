'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import Field from '@/components/auth/Field';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';
import type { AuthFormState } from '@/components/auth/formState';
import { emptyAuthFormState } from '@/components/auth/formState';

type RegisterFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  initialState?: AuthFormState;
};

const inputClass =
  'min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 aria-invalid:border-red-500';

const validateRegister = (formData: FormData): AuthFormState | null => {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Name is required.';
  if (!email) errors.email = 'Email is required.';
  else if (!/(.+)@(.+)\.(.{2,})/.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 8) errors.password = 'Password must contain at least 8 characters.';
  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match.';

  if (!Object.keys(errors).length) {
    return null;
  }

  return {
    errors,
    values: { name, email },
  };
};

export default function RegisterForm({
  action,
  initialState = emptyAuthFormState,
}: RegisterFormProps) {
  const [state, formAction] = useActionState(
    async (previousState: AuthFormState, formData: FormData) => {
      const validation = validateRegister(formData);
      if (validation) {
        return validation;
      }
      return action(previousState, formData);
    },
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {state.message}
        </p>
      )}

      <Field label="Name" name="name" required error={state.errors?.name}>
        <input
          className={inputClass}
          name="name"
          placeholder="John Doe"
          autoComplete="name"
          defaultValue={state.values?.name || ''}
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby="name-helper"
        />
      </Field>

      <Field
        label="Email"
        name="email"
        required
        error={state.errors?.email}
        helper="Used for account sign in and password recovery."
      >
        <input
          className={inputClass}
          name="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          defaultValue={state.values?.email || ''}
          aria-invalid={Boolean(state.errors?.email)}
          aria-describedby="email-helper"
        />
      </Field>

      <Field
        label="Password"
        name="password"
        required
        error={state.errors?.password}
        helper="Must contain at least 8 characters."
      >
        <PasswordInput
          className={inputClass}
          name="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          invalid={Boolean(state.errors?.password)}
          describedBy="password-helper"
        />
      </Field>

      <Field
        label="Confirm password"
        name="confirmPassword"
        required
        error={state.errors?.confirmPassword}
      >
        <PasswordInput
          className={inputClass}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Confirm your password"
          invalid={Boolean(state.errors?.confirmPassword)}
          describedBy="confirmPassword-helper"
        />
      </Field>

      <SubmitButton pendingText="Creating account...">Register</SubmitButton>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-semibold text-blue-900 hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
