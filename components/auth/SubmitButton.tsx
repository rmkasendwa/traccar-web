'use client';

import { useFormStatus } from 'react-dom';

type SubmitButtonProps = {
  children: string;
  pendingText?: string;
};

export default function SubmitButton({ children, pendingText = 'Working...' }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-11 rounded-md bg-emerald-700 px-4 font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 focus:ring-offset-(--color-paper) disabled:cursor-wait disabled:opacity-75"
      disabled={pending}
    >
      {pending ? pendingText : children}
    </button>
  );
}
