'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import Field from '@/components/auth/Field';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';
import type { AuthFormState } from '@/components/auth/formState';
import { emptyAuthFormState } from '@/components/auth/formState';

type ResetPasswordFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  token?: string;
  initialState?: AuthFormState;
};

const inputClass =
  'min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 aria-invalid:border-red-500';

const validateReset = (formData: FormData, hasToken: boolean): AuthFormState | null => {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const errors: Record<string, string> = {};

  if (!hasToken) {
    if (!email) errors.email = 'Email is required.';
    else if (!/(.+)@(.+)\.(.{2,})/.test(email)) errors.email = 'Enter a valid email address.';
  } else {
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8) errors.password = 'Password must contain at least 8 characters.';
    if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
    else if (password !== confirmPassword) errors.confirmPassword = 'Passwords must match.';
  }

  if (!Object.keys(errors).length) {
    return null;
  }

  return { errors, values: { email } };
};

export default function ResetPasswordForm({
  action,
  token,
  initialState = emptyAuthFormState,
}: ResetPasswordFormProps) {
  const hasToken = Boolean(token);
  const [state, formAction] = useActionState(
    async (previousState: AuthFormState, formData: FormData) => {
      const validation = validateReset(formData, hasToken);
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
        <p
          className={`rounded-md border p-3 text-sm ${
            state.errors && Object.keys(state.errors).length
              ? 'border-red-200 bg-red-50 text-red-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          {state.message}
        </p>
      )}

      <input type="hidden" name="token" value={token || ''} />

      {!hasToken ? (
        <Field
          label="Email"
          name="email"
          required
          error={state.errors?.email}
          helper="Used to find your account and send recovery instructions."
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
      ) : (
        <>
          <Field
            label="New password"
            name="password"
            required
            error={state.errors?.password}
            helper="Must contain at least 8 characters."
          >
            <PasswordInput
              className={inputClass}
              name="password"
              autoComplete="new-password"
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
              invalid={Boolean(state.errors?.confirmPassword)}
              describedBy="confirmPassword-helper"
            />
          </Field>
        </>
      )}

      <SubmitButton pendingText={hasToken ? 'Updating password...' : 'Sending instructions...'}>
        Reset password
      </SubmitButton>

      <p className="text-center text-sm">
        <Link className="font-semibold text-blue-900 hover:underline" href="/login">
          Return to Login
        </Link>
      </p>
    </form>
  );
}
