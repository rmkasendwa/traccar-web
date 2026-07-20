'use client';

import type { ReactNode } from 'react';
import ThemeModeControl from '@/components/ui/ThemeModeControl';
import LanguageSelect from '@/components/auth/LanguageSelect';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

type AuthShellProps = {
  titleKey: string;
  subtitle?: string;
  subtitleKey?: string;
  children: ReactNode;
};

export default function AuthShell({ titleKey, subtitle, subtitleKey, children }: AuthShellProps) {
  const t = useTranslation();
  const resolvedSubtitle = subtitleKey ? t(subtitleKey) : subtitle;
  return (
    <main className="h-dvh overflow-hidden bg-(--color-background) text-(--color-text)">
      <div className="flex h-full w-full flex-col overflow-hidden lg:flex-row">
        <aside className="relative flex shrink-0 items-center justify-between gap-3 bg-blue-950 px-4 py-5 text-white dark:bg-slate-950 sm:px-6 lg:h-full lg:basis-1/2 lg:flex-col lg:items-stretch lg:justify-between lg:overflow-hidden lg:p-12">
          <span
            role="img"
            aria-label="Traccar"
            className="block h-12 w-32 shrink-0 bg-white [mask:url('/logo-wordmark.svg')_left_center/contain_no-repeat] [-webkit-mask:url('/logo-wordmark.svg')_left_center/contain_no-repeat] sm:h-14 sm:w-52"
          />
          <div className="flex min-w-0 items-center justify-end gap-1.5 lg:absolute lg:right-5 lg:top-5">
            <LanguageSelect />
            <ThemeModeControl compact onDark popover />
          </div>
          <div className="hidden max-w-md lg:block">
            <p className="text-xs font-bold uppercase text-white/70">{t('authShellEyebrow')}</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">{t('authShellTitle')}</h1>
            <p className="mt-4 leading-7 text-white/75">{t('authShellDescription')}</p>
          </div>
        </aside>
        <section className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full w-full items-center justify-center p-4 py-8 sm:p-8 lg:py-10">
            <div className="w-full max-w-116 rounded-lg border border-(--color-divider) bg-(--color-paper) p-6 shadow-xl shadow-slate-900/10 dark:shadow-black/25 sm:p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">{t(titleKey)}</h2>
                {resolvedSubtitle && (
                  <p className="mt-1 text-sm leading-6 text-(--color-muted)">{resolvedSubtitle}</p>
                )}
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
