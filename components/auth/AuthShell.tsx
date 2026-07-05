import type { ReactNode } from 'react';
import ThemeModeControl from '@/components/ui/ThemeModeControl';
import LanguageSelect from '@/components/auth/LanguageSelect';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="h-dvh overflow-hidden bg-(--color-background) text-(--color-text)">
      <div className="flex h-full w-full flex-col overflow-hidden md:flex-row">
        <aside className="relative flex shrink-0 bg-blue-950 p-6 text-white dark:bg-slate-950 md:h-full md:basis-[44%] md:flex-col md:justify-between md:overflow-hidden md:p-12 lg:basis-[40%]">
          <span
            role="img"
            aria-label="Traccar"
            className="block h-14 w-36 max-w-full bg-white [mask:url('/logo-wordmark.svg')_center/contain_no-repeat] [-webkit-mask:url('/logo-wordmark.svg')_center/contain_no-repeat] sm:w-52"
          />
          <div className="absolute right-6 top-6 flex items-center gap-2 md:right-12 md:top-12">
            <LanguageSelect />
            <ThemeModeControl compact onDark popover />
          </div>
          <div className="hidden max-w-md md:block">
            <p className="text-xs font-bold uppercase text-white/70">
              Fleet visibility starts here
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Secure access to your workspace.
            </h1>
            <p className="mt-4 leading-7 text-white/75">
              Sign in, create an account, or recover access with a focused experience that works on
              every screen.
            </p>
          </div>
        </aside>
        <section className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex min-h-full w-full items-center justify-center p-4 py-8 sm:p-8 md:py-10">
            <div className="w-full max-w-116 rounded-lg border border-(--color-divider) bg-(--color-paper) p-6 shadow-xl shadow-slate-900/10 dark:shadow-black/25 sm:p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-(--color-muted)">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
