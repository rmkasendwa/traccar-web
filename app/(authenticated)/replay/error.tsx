'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

export default function ReplayError({ reset }: { reset: () => void }) {
  const t = useTranslation();
  return (
    <main className="grid h-full place-items-center bg-slate-50 p-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
          <AlertTriangle size={22} aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-slate-950">{t('replayErrorTitle')}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t('replayErrorDescription')}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          {t('sharedTryAgain')}
        </button>
      </div>
    </main>
  );
}
