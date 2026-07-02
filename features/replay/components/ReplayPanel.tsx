import Link from 'next/link';
import { ArrowLeft, ChevronsUpDown } from 'lucide-react';
import type { ReactNode } from 'react';

type ReplayPanelProps = {
  hasReplay: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export default function ReplayPanel({ hasReplay, children, footer }: ReplayPanelProps) {
  return (
    <aside
      className="absolute inset-x-3 bottom-3 z-30 flex max-h-[calc(100%-1.5rem)] w-auto flex-col overflow-hidden rounded-[1.35rem] border border-(--color-divider) bg-(--color-paper) text-(--color-text) shadow-2xl shadow-slate-950/25 md:inset-x-auto md:top-3 md:left-3 md:w-88"
      aria-label="Replay panel"
    >
      <input
        key={hasReplay ? 'loaded' : 'setup'}
        id="replay-panel-expanded"
        type="checkbox"
        defaultChecked={!hasReplay}
        className="peer sr-only"
        aria-label="Expand or collapse replay panel"
        aria-controls="replay-panel-content"
      />
      <header className="relative z-20 shrink-0 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-white backdrop-blur">
        <div className="pointer-events-none absolute -right-10 -top-16 h-36 w-36 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-12 h-28 w-28 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              aria-label="Back to tracking"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/8 text-slate-300 transition hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </Link>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-sky-300">
                History
              </p>
              <h1 className="truncate text-lg font-bold tracking-tight">Route replay</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasReplay && (
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[0.65rem] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Loaded
              </span>
            )}
            <label
              htmlFor="replay-panel-expanded"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-white/10 bg-white/8 text-slate-300 transition hover:bg-white/15 hover:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sky-400 md:hidden"
              title="Expand or collapse replay panel"
            >
              <ChevronsUpDown size={18} aria-hidden="true" />
            </label>
          </div>
        </div>
      </header>

      <div
        id="replay-panel-content"
        className="hidden min-h-0 flex-1 overflow-y-auto peer-checked:block md:block"
      >
        <div className="space-y-4 p-4">{children}</div>
      </div>

      {footer && (
        <div className="shrink-0 border-t border-(--color-divider) bg-(--color-paper) p-4 shadow-inner">
          {footer}
        </div>
      )}
    </aside>
  );
}
