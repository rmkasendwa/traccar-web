'use client';

import Field from '@/components/auth/Field';
import PasswordInput from '@/components/auth/PasswordInput';
import SubmitButton from '@/components/auth/SubmitButton';
import type { AuthFormState } from '@/components/auth/formState';
import { emptyAuthFormState } from '@/components/auth/formState';
import useLiveFormErrors from '@/components/auth/useLiveFormErrors';
import Link from 'next/link';
import { useActionState, useState, type ChangeEvent } from 'react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

type ResetPasswordFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  token?: string;
  initialState?: AuthFormState;
};

const inputClass =
  'min-h-11 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800 aria-invalid:border-red-500';

const resetValidators = {
  email: (formData: FormData) => {
    const email = String(formData.get('email') || '').trim();
    if (!email) return 'Email is required.';
    if (!/(.+)@(.+)\.(.{2,})/.test(email)) return 'Enter a valid email address.';
    return '';
  },
  password: (formData: FormData) => {
    const password = String(formData.get('password') || '');
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must contain at least 8 characters.';
    return '';
  },
  confirmPassword: (formData: FormData) => {
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');
    if (!confirmPassword) return 'Confirm your password.';
    if (password !== confirmPassword) return 'Passwords must match.';
    return '';
  },
};

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
  const { errors, fieldProps } = useLiveFormErrors(state.errors, resetValidators);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordFieldProps = fieldProps('password');
  const confirmPasswordFieldProps = fieldProps('confirmPassword');

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
          error={errors.email}
          helper="Used to find your account and send recovery instructions."
        >
          <input
            className={inputClass}
            name="email"
            type="email"
            placeholder="john@example.com"
            autoComplete="email"
            defaultValue={state.values?.email || ''}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="email-helper"
            {...fieldProps('email')}
          />
        </Field>
      ) : (
        <>
          <Field
            label="New password"
            name="password"
            required
            error={errors.password}
            helper="Must contain at least 8 characters."
          >
            <PasswordInput
              className={inputClass}
              name="password"
              placeholder="Create a new password"
              autoComplete="new-password"
              invalid={Boolean(errors.password)}
              describedBy="password-helper"
              value={password}
              visible={passwordVisible}
              onVisibleChange={setPasswordVisible}
              onBlur={passwordFieldProps.onBlur}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setPassword(event.target.value);
                passwordFieldProps.onChange(event);
                confirmPasswordFieldProps.onChange(event);
              }}
            />
          </Field>
          <PasswordStrengthMeter password={password} />

          <Field
            label="Confirm password"
            name="confirmPassword"
            required
            error={errors.confirmPassword}
          >
            <PasswordInput
              className={inputClass}
              name="confirmPassword"
              placeholder="Confirm your new password"
              autoComplete="new-password"
              invalid={Boolean(errors.confirmPassword)}
              describedBy="confirmPassword-helper"
              value={confirmPassword}
              visible={passwordVisible}
              onVisibleChange={setPasswordVisible}
              onBlur={confirmPasswordFieldProps.onBlur}
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(event.target.value);
                confirmPasswordFieldProps.onChange(event);
              }}
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
