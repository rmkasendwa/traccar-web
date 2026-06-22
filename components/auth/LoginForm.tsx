'use client';

import Field from '@/components/auth/Field';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';
import type { AuthFormState } from '@/components/auth/formState';
import { emptyAuthFormState } from '@/components/auth/formState';
import useLiveFormErrors from '@/components/auth/useLiveFormErrors';
import Link from 'next/link';
import { useActionState, useState, type ChangeEvent } from 'react';

type LoginFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  initialState?: AuthFormState;
  openIdEnabled: boolean;
  openIdForced: boolean;
};

const inputClass =
  'min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 aria-invalid:border-red-500';

const loginValidators = {
  email: (formData: FormData) =>
    String(formData.get('email') || '').trim() ? '' : 'Email or username is required.',
  password: (formData: FormData) =>
    String(formData.get('password') || '') ? '' : 'Password is required.',
  code: (formData: FormData) =>
    String(formData.get('code') || '').trim() ? '' : 'Verification code is required.',
};

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
  const { errors, fieldProps } = useLiveFormErrors(state.errors, loginValidators);
  const [password, setPassword] = useState('');
  const passwordFieldProps = fieldProps('password');

  return (
    <div className="flex flex-col gap-4">
      {!openIdForced && (
        <form action={formAction} className="flex flex-col gap-4" noValidate>
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

          <Field
            label="Email or username"
            name="email"
            required
            error={errors.email}
            helper="Use the email address or username for your account."
          >
            <input
              className={inputClass}
              name="email"
              autoComplete="email"
              defaultValue={state.values?.email || ''}
              placeholder="john@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby="email-helper"
              {...fieldProps('email')}
            />
          </Field>

          <Field
            label="Password"
            name="password"
            required
            error={errors.password}
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
              invalid={Boolean(errors.password)}
              describedBy="password-helper"
              value={password}
              onBlur={passwordFieldProps.onBlur}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setPassword(event.target.value);
                passwordFieldProps.onChange(event);
              }}
            />
          </Field>

          {state.totp && (
            <Field
              label="Verification code"
              name="code"
              required
              error={errors.code}
              helper="Enter the current code from your authenticator app."
            >
              <input
                className={inputClass}
                name="code"
                inputMode="numeric"
                placeholder="Enter your verification code"
                aria-invalid={Boolean(errors.code)}
                aria-describedby="code-helper"
                {...fieldProps('code')}
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
