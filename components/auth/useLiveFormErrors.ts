'use client';

import { useEffect, useState, type ChangeEvent, type FocusEvent } from 'react';
import type { AuthFormErrors } from '@/components/auth/formState';

type Validator = (formData: FormData) => string;
type Validators = Record<string, Validator>;

const EMPTY_ERRORS: AuthFormErrors = {};

const withoutError = (errors: AuthFormErrors, name: string) => {
  const next = { ...errors };
  delete next[name];
  return next;
};

export default function useLiveFormErrors(
  serverErrors: AuthFormErrors = EMPTY_ERRORS,
  validators: Validators,
) {
  const [errors, setErrors] = useState<AuthFormErrors>(serverErrors);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const serverErrorKey = JSON.stringify(serverErrors);

  useEffect(() => {
    setErrors(JSON.parse(serverErrorKey) as AuthFormErrors);
    setTouched({});
  }, [serverErrorKey]);

  const validateField = (name: string, form: HTMLFormElement | null, showError: boolean) => {
    if (!form || !validators[name]) {
      return;
    }
    const error = validators[name](new FormData(form));
    setErrors((current) => {
      if (error && showError) {
        return { ...current, [name]: error };
      }
      if (!error) {
        return withoutError(current, name);
      }
      return current;
    });
  };

  const fieldProps = (name: string) => ({
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      validateField(name, event.currentTarget.form, Boolean(touched[name] || errors[name]));
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      setTouched((current) => ({ ...current, [name]: true }));
      validateField(name, event.currentTarget.form, true);
    },
  });

  return { errors, fieldProps };
}
