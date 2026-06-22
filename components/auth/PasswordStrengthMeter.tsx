const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;

  return [
    { label: 'Not started', hint: 'Use at least 8 characters.', color: 'bg-slate-200' },
    { label: 'Weak', hint: 'Add more characters or variety.', color: 'bg-red-500' },
    { label: 'Fair', hint: 'Add uppercase, numbers, or symbols.', color: 'bg-amber-500' },
    { label: 'Good', hint: 'This password is almost there.', color: 'bg-sky-600' },
    { label: 'Strong', hint: 'Strong password.', color: 'bg-emerald-600' },
  ][score];
};

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const activeSegments = password
    ? Math.max(1, ['Weak', 'Fair', 'Good', 'Strong'].indexOf(strength.label) + 1)
    : 0;

  return (
    <div className="-mt-2 flex flex-col gap-1" aria-live="polite">
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 rounded-full ${segment <= activeSegments ? strength.color : 'bg-slate-200'}`}
          />
        ))}
      </div>
      <div className="flex justify-between gap-3 text-xs text-slate-500">
        <span>Password strength: {strength.label}</span>
        <span>{strength.hint}</span>
      </div>
    </div>
  );
}
