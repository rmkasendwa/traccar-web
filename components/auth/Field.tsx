import type { ReactNode } from 'react';

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  helper?: string;
  labelEnd?: ReactNode;
  children: ReactNode;
};

export default function Field({
  label,
  name,
  required,
  error,
  helper,
  labelEnd,
  children,
}: FieldProps) {
  const helperId = `${name}-helper`;

  return (
    <label className="flex flex-col gap-1 text-sm text-slate-600">
      <span className="flex items-center justify-between gap-3">
        <span>
          {label}
          {required && <span className="ml-1 font-bold text-red-600">*</span>}
        </span>
        {labelEnd}
      </span>
      {children}
      {(error || helper) && (
        <span id={helperId} className={`text-xs ${error ? 'text-red-700' : 'text-slate-500'}`}>
          {error || helper}
        </span>
      )}
    </label>
  );
}
