'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="grid h-full place-items-center bg-slate-100 p-6">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">We couldn’t load the tracking page</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Check your connection and try loading your devices again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
