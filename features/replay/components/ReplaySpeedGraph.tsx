'use client';

import { Activity, Expand, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui';
import { useReplayState } from '@/features/replay/components/ReplayPlayer';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const KNOTS_TO_KPH = 1.852;
const WIDTH = 300;
const HEIGHT = 112;
const MAX_RENDERED_POINTS = 400;

const speedKph = (speed?: number) =>
  Math.max(0, Number.isFinite(speed) ? (speed || 0) * KNOTS_TO_KPH : 0);

const timeOf = (value: string | undefined, fallback: number) => {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(time) ? time : fallback;
};

const formatTime = (value: string) =>
  Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(
        new Date(value),
      )
    : '';

export default function ReplaySpeedGraph() {
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { positions, index, selectPosition } = useReplayState();
  const chart = useMemo(() => {
    const startTime = timeOf(positions[0]?.fixTime, 0);
    const endTime = timeOf(positions.at(-1)?.fixTime, startTime);
    const duration = Math.max(1, endTime - startTime);
    const maximumSpeed = Math.max(...positions.map((position) => speedKph(position.speed)), 0);
    const scaleMaximum = Math.max(10, Math.ceil(maximumSpeed / 10) * 10);
    const step = Math.max(1, Math.ceil(positions.length / MAX_RENDERED_POINTS));
    const sampled = positions.filter(
      (_position, positionIndex) =>
        positionIndex % step === 0 || positionIndex === positions.length - 1,
    );
    const points = sampled
      .map((position, pointIndex) => {
        const fallbackTime = startTime + (pointIndex / Math.max(1, sampled.length - 1)) * duration;
        const x = ((timeOf(position.fixTime, fallbackTime) - startTime) / duration) * WIDTH;
        const y = HEIGHT - (speedKph(position.speed) / scaleMaximum) * HEIGHT;
        return `${Math.max(0, Math.min(WIDTH, x)).toFixed(1)},${Math.max(0, y).toFixed(1)}`;
      })
      .join(' ');

    return { startTime, duration, scaleMaximum, points };
  }, [positions]);

  const current = positions[index];
  const currentSpeed = speedKph(current?.speed);
  const currentX = current
    ? ((timeOf(current.fixTime, chart.startTime) - chart.startTime) / chart.duration) * 100
    : 0;
  const currentY = 100 - (currentSpeed / chart.scaleMaximum) * 100;

  const seekByTime = (sliderValue: number) => {
    const ratio = sliderValue / Math.max(positions.length - 1, 1);
    const targetTime = chart.startTime + ratio * chart.duration;
    const nearestIndex = positions.reduce(
      (nearest, position, positionIndex) =>
        Math.abs(timeOf(position.fixTime, targetTime) - targetTime) <
        Math.abs(timeOf(positions[nearest].fixTime, targetTime) - targetTime)
          ? positionIndex
          : nearest,
      0,
    );
    selectPosition(nearestIndex);
  };

  useEffect(() => {
    if (!expanded) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [expanded]);

  const renderGraph = (large: boolean) => (
    <section
      aria-label={t('replaySpeedGraph')}
      className={
        large
          ? 'bg-(--color-paper)'
          : 'rounded-3xl border border-(--color-divider) bg-(--color-paper) p-4 shadow-sm shadow-slate-950/5'
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id={large ? 'replay-speed-graph-dialog-title' : undefined}
          className={`flex items-center gap-2 font-semibold text-(--color-text) ${large ? 'text-lg' : 'text-xs'}`}
        >
          <Activity size={large ? 20 : 15} className="text-violet-600" aria-hidden="true" />
          {t('replaySpeedGraph')}
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[0.65rem] font-semibold text-violet-700 dark:text-violet-300">
            {currentSpeed.toFixed(0)} km/h
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!large)}
            aria-label={large ? t('sharedClose') : t('replaySpeedGraphExpand')}
            title={large ? t('sharedClose') : t('replaySpeedGraphExpand')}
            className="grid h-8 w-8 place-items-center rounded-lg border border-(--color-divider) text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            {large ? <X size={16} aria-hidden="true" /> : <Expand size={15} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <div
          className={`flex shrink-0 flex-col justify-between text-right text-(--color-muted) ${large ? 'h-80 text-xs md:h-[28rem]' : 'h-28 text-[0.58rem]'}`}
        >
          <span>{chart.scaleMaximum}</span>
          <span>{Math.round(chart.scaleMaximum / 2)}</span>
          <span>0</span>
        </div>
        <div
          className={`relative min-w-0 flex-1 overflow-hidden border-b border-l border-(--color-divider) bg-[linear-gradient(to_bottom,var(--color-divider)_1px,transparent_1px)] bg-[length:100%_50%] ${large ? 'h-80 md:h-[28rem]' : 'h-28'}`}
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <polyline
              points={chart.points}
              fill="none"
              stroke="rgb(124 58 237)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="pointer-events-none absolute inset-y-0 w-px bg-sky-500"
            style={{ left: `${Math.max(0, Math.min(100, currentX))}%` }}
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-500 shadow"
            style={{
              left: `${Math.max(0, Math.min(100, currentX))}%`,
              top: `${Math.max(0, Math.min(100, currentY))}%`,
            }}
            aria-hidden="true"
          />
          <input
            type="range"
            min={0}
            max={Math.max(positions.length - 1, 0)}
            value={index}
            onChange={(event) => seekByTime(Number(event.currentTarget.value))}
            aria-label={t('replaySpeedGraphSeek')}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>

      <div
        className={`mt-1.5 ml-6 flex justify-between font-medium text-(--color-muted) ${large ? 'text-xs' : 'text-[0.6rem]'}`}
      >
        <span>{positions[0] ? formatTime(positions[0].fixTime) : ''}</span>
        <span>{positions.at(-1) ? formatTime(positions.at(-1)!.fixTime) : ''}</span>
      </div>
      <p className="mt-2 text-[0.65rem] leading-4 text-(--color-muted)">
        {t('replaySpeedGraphHint')}
      </p>
    </section>
  );

  return (
    <>
      {renderGraph(false)}
      <Dialog
        open={expanded}
        onClose={() => setExpanded(false)}
        fullWidth
        maxWidth="lg"
        aria-labelledby="replay-speed-graph-dialog-title"
        className="!max-w-6xl rounded-3xl"
      >
        <DialogContent className="p-5 md:p-7">{renderGraph(true)}</DialogContent>
      </Dialog>
    </>
  );
}
