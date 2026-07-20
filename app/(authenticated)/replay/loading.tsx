import { ArrowLeft, CalendarDays } from 'lucide-react';
import ReplayMapPlaceholder from '@/features/replay/components/ReplayMapPlaceholder';
import en from '@/providers/localization/messages/en.json';

const t = (key: string) => en[key as keyof typeof en] ?? key;

export default function ReplayLoading() {
  return (
    <main className="relative h-full min-h-0 overflow-hidden bg-slate-200" aria-busy="true">
      <div className="absolute inset-0">
        <ReplayMapPlaceholder />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-md bg-linear-to-r from-slate-950/20 to-transparent md:block" />

      <aside className="absolute inset-x-3 bottom-3 z-30 max-h-[calc(100%-1.5rem)] overflow-hidden rounded-[1.35rem] border border-(--color-divider) bg-(--color-paper) text-(--color-text) shadow-2xl shadow-slate-950/25 md:inset-x-auto md:top-3 md:left-3 md:w-88">
        <header className="relative overflow-hidden rounded-t-[1.3rem] bg-slate-950 px-4 pb-4 pt-3 text-white">
          <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400">
              <ArrowLeft size={18} aria-hidden="true" />
            </span>
            <h1 className="text-lg font-bold tracking-tight">{t('replayTitle')}</h1>
          </div>
        </header>

        <div className="space-y-4 p-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
              {t('replayDevice')}
            </p>
            <div className="mt-1.5 h-11 animate-pulse rounded-xl border border-(--color-divider) bg-(--color-surface-subtle)" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
              <CalendarDays size={14} aria-hidden="true" /> {t('replayPeriod')}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-8.5 animate-pulse rounded-lg border border-(--color-divider) bg-(--color-surface-subtle)"
                />
              ))}
              <div className="col-span-2 h-8.5 animate-pulse rounded-lg border border-(--color-divider) bg-(--color-surface-subtle)" />
            </div>
          </div>
          <div className="h-11 animate-pulse rounded-xl bg-(--color-text)" />
          <div className="rounded-2xl border border-dashed border-(--color-divider) bg-(--color-surface-subtle) p-5">
            <div className="mx-auto h-10 w-10 animate-pulse rounded-xl bg-(--color-paper) shadow-sm" />
            <div className="mx-auto mt-3 h-4 w-32 animate-pulse rounded bg-(--color-divider)" />
            <div className="mx-auto mt-2 h-3 w-48 max-w-full animate-pulse rounded bg-(--color-divider) opacity-60" />
          </div>
        </div>
      </aside>
      <span className="sr-only">{t('replayLoadingPage')}</span>
    </main>
  );
}
