'use client';

import { Activity, Expand, RotateCcw, X } from 'lucide-react';
import { useEffect, useMemo, useState, type WheelEvent } from 'react';
import { Dialog, DialogContent } from '@/components/ui';
import { useReplayState } from '@/features/replay/components/ReplayPlayer';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const KNOTS_TO_KPH = 1.852;
const WIDTH = 300;
const HEIGHT = 112;
const MAX_RENDERED_POINTS = 400;
const MAX_ZOOM = 16;

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

const formatTooltipTime = (value: string | undefined) =>
  value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(value))
    : '';

export default function ReplaySpeedGraph() {
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewportCenter, setViewportCenter] = useState(0.5);
  const { positions, index, selectPosition } = useReplayState();
  const chart = useMemo(() => {
    const startTime = timeOf(positions[0]?.fixTime, 0);
    const endTime = timeOf(positions.at(-1)?.fixTime, startTime);
    const fullDuration = Math.max(1, endTime - startTime);
    const duration = fullDuration / zoom;
    const requestedStart = startTime + viewportCenter * fullDuration - duration / 2;
    const viewStart = Math.max(startTime, Math.min(endTime - duration, requestedStart));
    const viewEnd = viewStart + duration;
    const visiblePositions = positions.filter((position) => {
      const time = timeOf(position.fixTime, viewStart);
      return time >= viewStart && time <= viewEnd;
    });
    const maximumSpeed = Math.max(
      ...visiblePositions.map((position) => speedKph(position.speed)),
      0,
    );
    const scaleMaximum = Math.max(10, Math.ceil(maximumSpeed / 10) * 10);
    const step = Math.max(1, Math.ceil(visiblePositions.length / MAX_RENDERED_POINTS));
    const sampled = visiblePositions.filter(
      (_position, positionIndex) =>
        positionIndex % step === 0 || positionIndex === visiblePositions.length - 1,
    );
    const points = sampled
      .map((position, pointIndex) => {
        const fallbackTime = viewStart + (pointIndex / Math.max(1, sampled.length - 1)) * duration;
        const x = ((timeOf(position.fixTime, fallbackTime) - viewStart) / duration) * WIDTH;
        const y = HEIGHT - (speedKph(position.speed) / scaleMaximum) * HEIGHT;
        return `${Math.max(0, Math.min(WIDTH, x)).toFixed(1)},${Math.max(0, y).toFixed(1)}`;
      })
      .join(' ');

    return {
      startTime,
      endTime,
      fullDuration,
      viewStart,
      viewEnd,
      duration,
      scaleMaximum,
      points,
    };
  }, [positions, viewportCenter, zoom]);

  const current = positions[index];
  const currentSpeed = speedKph(current?.speed);
  const currentX = current
    ? ((timeOf(current.fixTime, chart.viewStart) - chart.viewStart) / chart.duration) * 100
    : 0;
  const currentY = 100 - (currentSpeed / chart.scaleMaximum) * 100;
  const currentVisible = currentX >= 0 && currentX <= 100;

  const seekByTime = (sliderValue: number) => {
    const ratio = sliderValue / Math.max(positions.length - 1, 1);
    const targetTime = chart.viewStart + ratio * chart.duration;
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

  const zoomWithWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!expanded) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const nextZoom = Math.max(1, Math.min(MAX_ZOOM, zoom * (event.deltaY < 0 ? 1.5 : 1 / 1.5)));
    if (nextZoom === zoom) return;

    const anchorTime = chart.viewStart + anchor * chart.duration;
    const nextDuration = chart.fullDuration / nextZoom;
    const nextViewStart = Math.max(
      chart.startTime,
      Math.min(chart.endTime - nextDuration, anchorTime - anchor * nextDuration),
    );
    setViewportCenter((nextViewStart + nextDuration / 2 - chart.startTime) / chart.fullDuration);
    setZoom(nextZoom);
  };

  const resetZoom = () => {
    setZoom(1);
    setViewportCenter(0.5);
  };

  const closeExpandedGraph = () => {
    setExpanded(false);
    resetZoom();
  };

  useEffect(() => {
    if (!expanded) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeExpandedGraph();
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
          {large && zoom > 1 && (
            <button
              type="button"
              onClick={resetZoom}
              title={t('replaySpeedGraphResetZoom')}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-(--color-divider) px-2 text-xs font-semibold text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <RotateCcw size={13} aria-hidden="true" /> {zoom.toFixed(1)}×
            </button>
          )}
          <button
            type="button"
            onClick={() => (large ? closeExpandedGraph() : setExpanded(true))}
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
          className={`flex shrink-0 flex-col justify-between text-right text-(--color-muted) ${large ? 'h-[calc(80vh-11rem)] min-h-72 text-xs' : 'h-28 text-[0.58rem]'}`}
        >
          <span>{chart.scaleMaximum}</span>
          <span>{Math.round(chart.scaleMaximum / 2)}</span>
          <span>0</span>
        </div>
        <div
          onWheel={zoomWithWheel}
          className={`relative min-w-0 flex-1 overflow-hidden border-b border-l border-(--color-divider) bg-[linear-gradient(to_bottom,var(--color-divider)_1px,transparent_1px)] bg-[length:100%_50%] ${large ? 'h-[calc(80vh-11rem)] min-h-72' : 'h-28'}`}
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
          {currentVisible && (
            <>
              <span
                className="pointer-events-none absolute inset-y-0 w-px bg-sky-500"
                style={{ left: `${currentX}%` }}
                aria-hidden="true"
              />
              <span
                className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-500 shadow"
                style={{ left: `${currentX}%`, top: `${Math.max(0, Math.min(100, currentY))}%` }}
                aria-hidden="true"
              />
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 font-semibold text-white shadow-lg ${large ? 'text-xs' : 'text-[0.6rem]'}`}
                style={{
                  left: `${Math.max(14, Math.min(86, currentX))}%`,
                  top: `${Math.max(0, Math.min(100, currentY))}%`,
                  transform: `translate(-50%, ${currentY < 28 ? '10px' : 'calc(-100% - 10px)'})`,
                }}
              >
                {formatTooltipTime(current?.fixTime)} · {currentSpeed.toFixed(0)} km/h
              </span>
            </>
          )}
          <input
            type="range"
            min={0}
            max={Math.max(positions.length - 1, 0)}
            value={Math.round(Math.max(0, Math.min(1, currentX / 100)) * (positions.length - 1))}
            onChange={(event) => seekByTime(Number(event.currentTarget.value))}
            aria-label={t('replaySpeedGraphSeek')}
            aria-valuetext={`${formatTooltipTime(current?.fixTime)}, ${currentSpeed.toFixed(0)} km/h`}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
      </div>

      <div
        className={`mt-1.5 ml-6 flex justify-between font-medium text-(--color-muted) ${large ? 'text-xs' : 'text-[0.6rem]'}`}
      >
        <span>{formatTime(new Date(chart.viewStart).toISOString())}</span>
        <span>{formatTime(new Date(chart.viewEnd).toISOString())}</span>
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
        onClose={closeExpandedGraph}
        fullWidth
        maxWidth="lg"
        aria-labelledby="replay-speed-graph-dialog-title"
        className="h-[80vh] !max-h-[80vh] !max-w-5xl rounded-3xl"
      >
        <DialogContent className="p-5 md:p-7">{renderGraph(true)}</DialogContent>
      </Dialog>
    </>
  );
}
