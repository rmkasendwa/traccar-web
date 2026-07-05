'use client';

import Link from 'next/link';
import { useActionState, useState, type ChangeEvent } from 'react';
import Field from '@/components/auth/Field';
import PasswordInput from '@/components/auth/PasswordInput';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import SubmitButton from '@/components/auth/SubmitButton';
import type { AuthFormState } from '@/components/auth/formState';
import { emptyAuthFormState } from '@/components/auth/formState';
import useLiveFormErrors from '@/components/auth/useLiveFormErrors';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

type RegisterFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  initialState?: AuthFormState;
};

const inputClass =
  'min-h-11 w-full rounded-md border border-(--color-divider) bg-(--color-paper) px-3 py-2 text-(--color-text) outline-none focus:border-(--color-primary) focus:ring-1 focus:ring-(--color-primary) aria-invalid:border-red-500';

const registerValidators = {
  name: (formData: FormData) =>
    String(formData.get('name') || '').trim() ? '' : 'Name is required.',
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
  const t = useTranslation();
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
  const { errors, fieldProps } = useLiveFormErrors(state.errors, registerValidators);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordFieldProps = fieldProps('password');
  const confirmPasswordFieldProps = fieldProps('confirmPassword');

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {state.message && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          {state.message}
        </p>
      )}

      <Field label={t('sharedName')} name="name" required error={errors.name}>
        <input
          className={inputClass}
          name="name"
          placeholder="John Doe"
          autoComplete="name"
          defaultValue={state.values?.name || ''}
          aria-invalid={Boolean(errors.name)}
          aria-describedby="name-helper"
          {...fieldProps('name')}
        />
      </Field>

      <Field
        label={t('userEmail')}
        name="email"
        required
        error={errors.email}
        helper="Used for account sign in and password recovery."
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

      <Field
        label={t('userPassword')}
        name="password"
        required
        error={errors.password}
        helper="Must contain at least 8 characters."
      >
        <PasswordInput
          className={inputClass}
          name="password"
          autoComplete="new-password"
          placeholder={t('userPassword')}
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
        label={t('userPassword')}
        name="confirmPassword"
        required
        error={errors.confirmPassword}
      >
        <PasswordInput
          className={inputClass}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t('userPassword')}
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

      <SubmitButton pendingText={t('sharedLoading')}>{t('loginRegister')}</SubmitButton>

      <p className="text-center text-sm text-(--color-muted)">
        <Link className="font-semibold text-(--color-primary) hover:underline" href="/login">
          {t('loginLogin')}
        </Link>
      </p>
    </form>
  );
}
