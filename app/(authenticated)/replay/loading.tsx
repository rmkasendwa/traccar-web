import { ArrowLeft, CalendarDays } from 'lucide-react';
import ReplayMapPlaceholder from '@/features/replay/components/ReplayMapPlaceholder';

export default function ReplayLoading() {
  return (
    <main className="relative h-full min-h-0 overflow-hidden bg-slate-200" aria-busy="true">
      <div className="absolute inset-0">
        <ReplayMapPlaceholder />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[28rem] bg-linear-to-r from-slate-950/20 to-transparent md:block" />

      <aside className="absolute inset-x-3 top-3 z-30 max-h-[calc(100%-10rem)] overflow-hidden rounded-[1.35rem] border border-white/60 bg-white/94 shadow-2xl shadow-slate-950/25 backdrop-blur-xl md:inset-x-auto md:bottom-3 md:left-3 md:w-[22rem] md:max-h-none">
        <header className="relative overflow-hidden rounded-t-[1.3rem] bg-slate-950 px-4 pb-4 pt-3 text-white">
          <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-sky-500/25 blur-3xl" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/8 text-slate-300">
              <ArrowLeft size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sky-300">
                History
              </p>
              <h1 className="text-lg font-bold tracking-tight">Route replay</h1>
            </div>
          </div>
        </header>

        <div className="space-y-4 p-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Device
            </p>
            <div className="mt-1.5 h-11 rounded-xl border border-slate-200 bg-slate-100" />
          </div>
          <div>
            <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
              <CalendarDays size={14} aria-hidden="true" /> Replay period
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="h-[2.125rem] rounded-lg border border-slate-200 bg-slate-50"
                />
              ))}
              <div className="col-span-2 h-[2.125rem] rounded-lg border border-slate-200 bg-slate-50" />
            </div>
          </div>
          <div className="h-11 rounded-xl bg-slate-950" />
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 p-5">
            <div className="mx-auto h-10 w-10 rounded-xl bg-white shadow-sm" />
            <div className="mx-auto mt-3 h-4 w-32 rounded bg-slate-200" />
            <div className="mx-auto mt-2 h-3 w-48 max-w-full rounded bg-slate-100" />
          </div>
        </div>
      </aside>
      <span className="sr-only">Loading route replay</span>
    </main>
  );
}
