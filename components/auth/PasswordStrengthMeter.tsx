'use client';

import { useTranslation } from '@/providers/localization/LocalizationProvider';

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;

  const color = [
    'bg-(--color-divider)',
    'bg-red-500',
    'bg-amber-500',
    'bg-sky-600',
    'bg-emerald-600',
  ][score];
  return { score, color };
};

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const t = useTranslation();
  const { score, color } = getPasswordStrength(password);
  const activeSegments = password ? Math.max(1, score) : 0;
  const labels = [
    'authStrengthNotStarted',
    'authStrengthWeak',
    'authStrengthFair',
    'authStrengthGood',
    'authStrengthStrong',
  ];
  const hints = [
    'authStrengthHintStart',
    'authStrengthHintWeak',
    'authStrengthHintFair',
    'authStrengthHintGood',
    'authStrengthHintStrong',
  ];

  return (
    <div
      className="-mt-2 flex flex-col gap-1"
      role="meter"
      aria-label={t('authPasswordStrength')}
      aria-valuenow={activeSegments}
      aria-valuemin={0}
      aria-valuemax={4}
    >
      <div className="grid grid-cols-4 gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1.5 rounded-full ${segment <= activeSegments ? color : 'bg-(--color-divider)'}`}
          />
        ))}
      </div>
      <div className="flex justify-between gap-3 text-xs text-(--color-muted)">
        <span>
          {t('authPasswordStrength')}: {t(labels[score])}
        </span>
        <span>{t(hints[score])}</span>
      </div>
    </div>
  );
}
