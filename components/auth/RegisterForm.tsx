'use client';

import Link from 'next/link';
import { useActionState, useState, type ChangeEvent } from 'react';
import { routes } from '@/lib/routes';
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

type Translate = (key: string) => string;

const getRegisterValidators = (t: Translate) => ({
  name: (formData: FormData) =>
    String(formData.get('name') || '').trim() ? '' : t('authNameRequired'),
  email: (formData: FormData) => {
    const email = String(formData.get('email') || '').trim();
    if (!email) return t('authEmailRequired');
    if (!/(.+)@(.+)\.(.{2,})/.test(email)) return t('authEmailInvalid');
    return '';
  },
  password: (formData: FormData) => {
    const password = String(formData.get('password') || '');
    if (!password || password.length < 8) {
      return password ? t('authPasswordMinimum') : t('authPasswordRequired');
    }
    return '';
  },
  confirmPassword: (formData: FormData) => {
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');
    if (!confirmPassword) return t('authConfirmPasswordRequired');
    if (password !== confirmPassword) return t('authPasswordsMismatch');
    return '';
  },
});

const validateRegister = (
  formData: FormData,
  validators: ReturnType<typeof getRegisterValidators>,
): AuthFormState | null => {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const errors: Record<string, string> = {};

  const formValues = new FormData();
  formValues.set('name', name);
  formValues.set('email', email);
  formValues.set('password', password);
  formValues.set('confirmPassword', confirmPassword);
  Object.entries(validators).forEach(([key, validator]) => {
    const error = validator(formValues);
    if (error) errors[key] = error;
  });

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
  const registerValidators = getRegisterValidators(t);
  const [state, formAction] = useActionState(
    async (previousState: AuthFormState, formData: FormData) => {
      const validation = validateRegister(formData, registerValidators);
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
        helper={t('authEmailHelper')}
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
        helper={t('authPasswordMinimum')}
      >
        <PasswordInput
          className={inputClass}
          name="password"
          autoComplete="new-password"
          placeholder={t('authCreateStrongPassword')}
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
        label={t('authConfirmPassword')}
        name="confirmPassword"
        required
        error={errors.confirmPassword}
      >
        <PasswordInput
          className={inputClass}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t('authConfirmPasswordPlaceholder')}
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
        <Link className="font-semibold text-(--color-primary) hover:underline" href={routes.login}>
          {t('loginLogin')}
        </Link>
      </p>
    </form>
  );
}
