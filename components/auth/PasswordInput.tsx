'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  name: string;
  autoComplete: string;
  className: string;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
};

export default function PasswordInput({
  name,
  autoComplete,
  className,
  placeholder,
  invalid,
  describedBy,
  visible: controlledVisible,
  onVisibleChange,
  ...props
}: PasswordInputProps) {
  const [uncontrolledVisible, setUncontrolledVisible] = useState(false);
  const visible = controlledVisible ?? uncontrolledVisible;
  const setVisible = onVisibleChange ?? setUncontrolledVisible;

  return (
    <span className="relative">
      <input
        className={`${className} pr-11`}
        name={name}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        required
        {...props}
      />
      <button
        type="button"
        className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-800"
        aria-label={visible ? 'Hide password' : 'Show password'}
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </span>
  );
}
