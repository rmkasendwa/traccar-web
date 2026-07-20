'use client';

import { useTranslation } from '@/providers/localization/LocalizationProvider';

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslation();
  return (
    <div className="grid h-full place-items-center bg-slate-100 p-6">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">{t('errorTrackingLoad')}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t('errorTrackingLoadDescription')}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {t('sharedTryAgain')}
        </button>
      </div>
    </div>
  );
}
