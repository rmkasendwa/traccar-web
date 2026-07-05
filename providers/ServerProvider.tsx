'use client';

import { useState, type ReactNode } from 'react';
import { RefreshCw, ServerOff, WifiOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useAsyncTask } from '@/lib/react';
import { sessionActions } from '@/store';
import Loader from '@/components/ui/Loader';

type ServerProviderProps = {
  children: ReactNode;
};

const getErrorMessage = (value: string) => {
  try {
    const parsed = JSON.parse(value);
    return parsed.error || parsed.message || value;
  } catch {
    return value;
  }
};

const ServerProvider = ({ children }: ServerProviderProps) => {
  const dispatch = useDispatch();
  const initialized = useSelector((state: any) => Boolean(state.session.server));
  const [error, setError] = useState<string | null>(null);

  useAsyncTask(
    async ({ signal }: { signal: AbortSignal }) => {
      if (!error) {
        try {
          const response = await fetch('/api/server', { signal });
          if (response.ok) {
            dispatch(sessionActions.updateServer(await response.json()));
          } else {
            const message = await response.text();
            throw Error(message || response.statusText);
          }
        } catch (caughtError) {
          if (caughtError instanceof Error && caughtError.name !== 'AbortError') {
            setError(getErrorMessage(caughtError.message));
          }
        }
      }
    },
    [error, dispatch],
  );

  if (error) {
    return (
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-(--color-background) px-5 py-10 text-(--color-text)">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,color-mix(in_srgb,var(--color-primary)_18%,transparent),transparent_42%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--color-primary) opacity-[0.035] blur-3xl"
        />

        <section
          role="alert"
          aria-labelledby="connection-error-title"
          className="relative w-full max-w-md rounded-3xl border border-(--color-divider) bg-(--color-paper) p-7 shadow-2xl shadow-slate-950/10 sm:p-10 dark:shadow-black/30"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-1 ring-inset ring-amber-500/20 dark:text-amber-400">
              <ServerOff aria-hidden="true" size={27} strokeWidth={1.8} />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Connection interrupted
            </div>
          </div>

          <h1
            id="connection-error-title"
            className="mt-8 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            We can&apos;t reach the server
          </h1>
          <p className="mt-3 text-sm leading-6 text-(--color-muted) sm:text-base">
            The app is ready, but the backend isn&apos;t responding. Check your connection or try
            again in a moment.
          </p>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-(--color-divider) bg-(--color-surface-subtle) p-4">
            <WifiOff
              aria-hidden="true"
              size={18}
              className="mt-0.5 shrink-0 text-(--color-muted)"
            />
            <div className="min-w-0">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-(--color-muted)">
                Server response
              </p>
              <p className="mt-1 wrap-break-word text-sm font-medium">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-5 font-semibold text-white shadow-lg shadow-sky-950/15 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) active:translate-y-0"
          >
            <RefreshCw aria-hidden="true" size={18} />
            Try connecting again
          </button>

          <p className="mb-0 mt-5 text-center text-xs leading-5 text-(--color-muted)">
            Your data and settings haven&apos;t been affected.
          </p>
        </section>
      </main>
    );
  }

  if (!initialized) {
    return <Loader />;
  }

  return children;
};

export default ServerProvider;
