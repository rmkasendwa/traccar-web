'use client';

import { CircleAlert, RotateCcw } from 'lucide-react';

export default function ReportsError({ reset }: { reset: () => void }) {
  return (
    <div className="grid h-full place-items-center bg-slate-100 p-6">
      <div className="max-w-md rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
          <CircleAlert size={22} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-slate-950">We couldn’t load this report</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Check your connection or adjust the report criteria, then try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
        >
          <RotateCcw size={16} /> Try again
        </button>
      </div>
    </div>
  );
}
