'use client';

import { useTranslation } from '@/providers/localization/LocalizationProvider';

const Loader = () => {
  const t = useTranslation();
  return (
    <div
      className="flex min-h-full w-full items-center justify-center"
      role="status"
      aria-label={t('sharedLoading')}
    >
      <div className="size-10 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600" />
    </div>
  );
};

export default Loader;
