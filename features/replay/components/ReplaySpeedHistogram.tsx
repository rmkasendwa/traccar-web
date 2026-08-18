'use client';

import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { useReplayState } from '@/features/replay/components/ReplayPlayer';
import { calculateSpeedHistogram } from '@/features/replay/lib/replay';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const KNOTS_TO_KPH = 1.852;

export default function ReplaySpeedHistogram() {
  const t = useTranslation();
  const { positions, index, selectPosition } = useReplayState();
  const bins = useMemo(() => calculateSpeedHistogram(positions), [positions]);
  const maximumCount = Math.max(...bins.map((bin) => bin.count), 1);
  const currentSpeed = Math.max(0, (positions[index]?.speed || 0) * KNOTS_TO_KPH);
  const activeBinIndex = Math.min(
    Math.floor(currentSpeed / (bins[0]?.endKph || 1)),
    bins.length - 1,
  );

  return (
    <section
      aria-label={t('replaySpeedHistogram')}
      className="rounded-3xl border border-(--color-divider) bg-(--color-paper) p-4 shadow-sm shadow-slate-950/5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold text-(--color-text)">
          <BarChart3 size={15} className="text-sky-600" aria-hidden="true" />
          {t('replaySpeedHistogram')}
        </h2>
        <span className="text-[0.65rem] text-(--color-muted)">{t('replayGpsPoints')}</span>
      </div>

      <div className="mt-4 flex h-28 items-end gap-1.5 border-b border-(--color-divider) px-0.5">
        {bins.map((bin, binIndex) => {
          const active = binIndex === activeBinIndex;
          const percentage = Math.round((bin.count / positions.length) * 100);
          const label = `${bin.startKph}–${bin.endKph} km/h: ${bin.count} ${t('replayGpsPoints')} (${percentage}%)`;

          return (
            <button
              key={bin.startKph}
              type="button"
              disabled={!bin.count}
              onClick={() => selectPosition(bin.firstPositionIndex)}
              aria-label={label}
              aria-current={active ? 'true' : undefined}
              title={label}
              className="group flex h-full min-w-0 flex-1 items-end rounded-t-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:cursor-default"
            >
              <span
                className={`block w-full min-w-1 rounded-t-sm transition-colors ${
                  active ? 'bg-sky-500' : 'bg-sky-300 group-hover:bg-sky-400 dark:bg-sky-700'
                }`}
                style={{
                  height: `${Math.max(bin.count ? 6 : 1, (bin.count / maximumCount) * 100)}%`,
                }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 flex justify-between text-[0.6rem] font-medium text-(--color-muted)">
        <span>0</span>
        <span>{bins.at(-1)?.endKph || 0} km/h</span>
      </div>
      <p className="mt-2 text-[0.65rem] leading-4 text-(--color-muted)">
        {t('replaySpeedHistogramHint')}
      </p>
    </section>
  );
}
