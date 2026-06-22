export type AuthFormErrors = Record<string, string>;

export type AuthFormState = {
  errors?: AuthFormErrors;
  message?: string;
  status?: 'error' | 'success' | 'info';
  values?: Record<string, string>;
  totp?: boolean;
};

export const emptyAuthFormState: AuthFormState = {
  errors: {},
  values: {},
};
