'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import Field from '@/components/auth/Field';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';
import type { AuthFormState } from '@/components/auth/formState';
import { emptyAuthFormState } from '@/components/auth/formState';

type LoginFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  initialState?: AuthFormState;
  openIdEnabled: boolean;
  openIdForced: boolean;
};

const inputClass =
  'min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 aria-invalid:border-red-500';

const validateLogin = (formData: FormData, totp?: boolean): AuthFormState | null => {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const code = String(formData.get('code') || '').trim();
  const errors: Record<string, string> = {};

  if (!email) errors.email = 'Email or username is required.';
  if (!password) errors.password = 'Password is required.';
  if (totp && !code) errors.code = 'Verification code is required.';

  if (!Object.keys(errors).length) {
    return null;
  }

  return {
    errors,
    values: { email },
    totp,
  };
};

export default function LoginForm({
  action,
  initialState = emptyAuthFormState,
  openIdEnabled,
  openIdForced,
}: LoginFormProps) {
  const [state, formAction] = useActionState(
    async (previousState: AuthFormState, formData: FormData) => {
      const validation = validateLogin(formData, previousState.totp);
      if (validation) {
        return validation;
      }
      return action(previousState, formData);
    },
    initialState,
  );

  return (
    <div className="flex flex-col gap-4">
      {state.message && (
        <p
          className={`rounded-md border p-3 text-sm ${
            state.status === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {state.message}
        </p>
      )}

      {!openIdForced && (
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <Field
            label="Email or username"
            name="email"
            required
            error={state.errors?.email}
            helper="Use the email address or username for your account."
          >
            <input
              className={inputClass}
              name="email"
              autoComplete="email"
              defaultValue={state.values?.email || ''}
              placeholder="john@example.com"
              aria-invalid={Boolean(state.errors?.email)}
              aria-describedby="email-helper"
            />
          </Field>

          <Field
            label="Password"
            name="password"
            required
            error={state.errors?.password}
            labelEnd={
              <Link
                className="text-xs font-semibold text-blue-900 hover:underline"
                href="/reset-password"
              >
                Forgot your password?
              </Link>
            }
          >
            <PasswordInput
              className={inputClass}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              invalid={Boolean(state.errors?.password)}
              describedBy="password-helper"
            />
          </Field>

          {state.totp && (
            <Field
              label="Verification code"
              name="code"
              required
              error={state.errors?.code}
              helper="Enter the current code from your authenticator app."
            >
              <input
                className={inputClass}
                name="code"
                inputMode="numeric"
                placeholder="Enter your verification code"
                aria-invalid={Boolean(state.errors?.code)}
                aria-describedby="code-helper"
              />
            </Field>
          )}

          <SubmitButton pendingText="Signing in...">Sign in</SubmitButton>
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
  );
}
