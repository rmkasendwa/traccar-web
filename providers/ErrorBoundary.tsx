'use client';

import React, { type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, ChevronDown, RefreshCw, RotateCcw } from 'lucide-react';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-(--color-background) px-5 py-10 text-(--color-text)">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--color-primary)_14%,transparent),transparent_38%)]"
        />

        <section
          aria-labelledby="app-error-title"
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-(--color-divider) bg-(--color-paper) p-7 shadow-2xl shadow-slate-950/10 sm:p-10 dark:shadow-black/25"
        >
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-600 ring-1 ring-inset ring-red-500/15 dark:text-red-400">
            <AlertTriangle aria-hidden="true" size={27} strokeWidth={2} />
          </div>

          <p className="mb-2 text-sm font-semibold tracking-wide text-(--color-primary)">
            Something went wrong
          </p>
          <h1
            id="app-error-title"
            className="m-0 text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            We hit an unexpected snag
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-(--color-muted) sm:text-base">
            The app couldn&apos;t finish that action. You can try again, or reload to start with a
            fresh connection.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-(--color-primary) px-5 font-semibold text-white shadow-sm shadow-sky-950/15 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
              <RotateCcw aria-hidden="true" size={18} />
              Try again
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-(--color-divider) bg-(--color-surface-subtle) px-5 font-semibold transition hover:bg-(--color-surface-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
            >
              <RefreshCw aria-hidden="true" size={18} />
              Reload app
            </button>
          </div>

          <details className="group mt-8 border-t border-(--color-divider) pt-5 text-sm text-(--color-muted)">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg py-1 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)">
              Technical details
              <ChevronDown
                aria-hidden="true"
                size={17}
                className="transition-transform group-open:rotate-180"
              />
            </summary>
            <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-(--color-surface-subtle) p-4 font-mono text-xs leading-5">
              {error.message || 'An unknown error occurred.'}
            </pre>
          </details>
        </section>
      </main>
    );
  }
}

export default ErrorBoundary;
