'use client';

import { Activity, Expand, Hand, MousePointer2, RotateCcw, X, ZoomIn } from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from 'react';
import { Dialog, DialogContent } from '@/components/ui';
import { useReplayState } from '@/features/replay/components/ReplayPlayer';
import type { ReplayPosition } from '@/features/replay/types';
import getSpeedColor from '@/lib/colors';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const KNOTS_TO_KPH = 1.852;
const WIDTH = 1000;
const HEIGHT = 320;
const MAX_RENDERED_POINTS = 700;
const MAX_ZOOM = 16;
const MARKER_DRAG_HIT_WIDTH = 24;

const speedKph = (speed?: number) =>
  Math.max(0, Number.isFinite(speed) ? (speed || 0) * KNOTS_TO_KPH : 0);

const timeOf = (value: string | undefined, fallback: number) => {
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(time) ? time : fallback;
};

const formatTime = (time: number, includeSeconds = false) =>
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
  }).format(new Date(time));

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

const nearestPositionIndex = (positions: ReplayPosition[], targetTime: number) =>
  positions.reduce(
    (nearest, position, positionIndex) =>
      Math.abs(timeOf(position.fixTime, targetTime) - targetTime) <
      Math.abs(timeOf(positions[nearest].fixTime, targetTime) - targetTime)
        ? positionIndex
        : nearest,
    0,
  );

const buildGeometry = (
  positions: ReplayPosition[],
  viewStart: number,
  viewEnd: number,
  scaleMaximum: number,
  minSpeed: number,
  maxSpeed: number,
) => {
  const duration = Math.max(1, viewEnd - viewStart);
  const visible = positions.filter((position) => {
    const time = timeOf(position.fixTime, viewStart);
    return time >= viewStart && time <= viewEnd;
  });
  const step = Math.max(1, Math.ceil(visible.length / MAX_RENDERED_POINTS));
  const sampled = visible.filter(
    (_position, positionIndex) =>
      positionIndex % step === 0 || positionIndex === visible.length - 1,
  );
  const coordinates = sampled.map((position, pointIndex) => {
    const fallback = viewStart + (pointIndex / Math.max(1, sampled.length - 1)) * duration;
    const x = ((timeOf(position.fixTime, fallback) - viewStart) / duration) * WIDTH;
    const y = HEIGHT - (speedKph(position.speed) / scaleMaximum) * HEIGHT;
    return {
      x: Math.max(0, Math.min(WIDTH, x)),
      y: Math.max(0, y),
      speed: position.speed || 0,
    };
  });
  const points = coordinates.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const segments = coordinates.slice(1).map((coordinate, pointIndex) => ({
    x1: coordinates[pointIndex].x,
    y1: coordinates[pointIndex].y,
    x2: coordinate.x,
    y2: coordinate.y,
    color: getSpeedColor(coordinate.speed, minSpeed, maxSpeed),
  }));

  return {
    points,
    segments,
    areaPoints: points ? `0,${HEIGHT} ${points} ${WIDTH},${HEIGHT}` : '',
    visibleCount: visible.length,
  };
};

export default function ReplaySpeedGraph() {
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [viewportCenter, setViewportCenter] = useState(0.5);
  const [panning, setPanning] = useState(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startViewStart: number;
    moved: boolean;
    mode: 'marker' | 'pan';
  } | null>(null);
  const { positions, index, selectPosition } = useReplayState();

  const fullChart = useMemo(() => {
    const startTime = timeOf(positions[0]?.fixTime, 0);
    const endTime = timeOf(positions.at(-1)?.fixTime, startTime);
    const duration = Math.max(1, endTime - startTime);
    const maximumSpeed = Math.max(...positions.map((position) => speedKph(position.speed)), 0);
    const speeds = positions.map((position) => position.speed || 0);
    const minSpeed = speeds.length ? Math.min(...speeds) : 0;
    const maxSpeed = speeds.length ? Math.max(...speeds) : 0;
    const scaleMaximum = Math.max(10, Math.ceil(maximumSpeed / 10) * 10);
    return {
      startTime,
      endTime,
      duration,
      scaleMaximum,
      minSpeed,
      maxSpeed,
      geometry: buildGeometry(positions, startTime, endTime, scaleMaximum, minSpeed, maxSpeed),
    };
  }, [positions]);

  const viewChart = useMemo(() => {
    const duration = fullChart.duration / zoom;
    const requestedStart = fullChart.startTime + viewportCenter * fullChart.duration - duration / 2;
    const viewStart = Math.max(
      fullChart.startTime,
      Math.min(fullChart.endTime - duration, requestedStart),
    );
    const viewEnd = viewStart + duration;
    return {
      viewStart,
      viewEnd,
      duration,
      geometry: buildGeometry(
        positions,
        viewStart,
        viewEnd,
        fullChart.scaleMaximum,
        fullChart.minSpeed,
        fullChart.maxSpeed,
      ),
    };
  }, [fullChart, positions, viewportCenter, zoom]);

  const current = positions[index];
  const currentTime = timeOf(current?.fixTime, fullChart.startTime);
  const currentSpeed = speedKph(current?.speed);
  const currentY = 100 - (currentSpeed / fullChart.scaleMaximum) * 100;
  const viewX = ((currentTime - viewChart.viewStart) / viewChart.duration) * 100;
  const currentVisibleInView = viewX >= 0 && viewX <= 100;

  const seekAtRatio = (ratio: number, viewStart: number, duration: number) => {
    const targetTime = viewStart + Math.max(0, Math.min(1, ratio)) * duration;
    selectPosition(nearestPositionIndex(positions, targetTime));
  };

  const resetZoom = () => {
    setZoom(1);
    setViewportCenter(0.5);
  };

  const closeExpandedGraph = () => {
    setExpanded(false);
    setPanning(false);
  };

  const zoomWithWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const anchor = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const nextZoom = Math.max(1, Math.min(MAX_ZOOM, zoom * (event.deltaY < 0 ? 1.35 : 1 / 1.35)));
    if (nextZoom === zoom) return;

    const anchorTime = viewChart.viewStart + anchor * viewChart.duration;
    const nextDuration = fullChart.duration / nextZoom;
    const nextStart = Math.max(
      fullChart.startTime,
      Math.min(fullChart.endTime - nextDuration, anchorTime - anchor * nextDuration),
    );
    setViewportCenter((nextStart + nextDuration / 2 - fullChart.startTime) / fullChart.duration);
    setZoom(nextZoom);
  };

  const startPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const markerX = rect.left + (viewX / 100) * rect.width;
    const draggingMarker =
      currentVisibleInView && Math.abs(event.clientX - markerX) <= MARKER_DRAG_HIT_WIDTH / 2;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startViewStart: viewChart.viewStart,
      moved: false,
      mode: draggingMarker ? 'marker' : 'pan',
    };
  };

  const movePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = event.clientX - drag.startX;
    if (drag.mode === 'marker') {
      drag.moved = true;
      seekAtRatio(
        (event.clientX - rect.left) / rect.width,
        viewChart.viewStart,
        viewChart.duration,
      );
      return;
    }
    if (Math.abs(deltaX) < 4 && !drag.moved) return;
    drag.moved = true;
    if (zoom <= 1) return;
    setPanning(true);
    const nextStart = Math.max(
      fullChart.startTime,
      Math.min(
        fullChart.endTime - viewChart.duration,
        drag.startViewStart - (deltaX / rect.width) * viewChart.duration,
      ),
    );
    setViewportCenter(
      (nextStart + viewChart.duration / 2 - fullChart.startTime) / fullChart.duration,
    );
  };

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.mode === 'marker') {
      const rect = event.currentTarget.getBoundingClientRect();
      seekAtRatio(
        (event.clientX - rect.left) / rect.width,
        viewChart.viewStart,
        viewChart.duration,
      );
    } else if (!drag.moved) {
      const rect = event.currentTarget.getBoundingClientRect();
      seekAtRatio(
        (event.clientX - rect.left) / rect.width,
        viewChart.viewStart,
        viewChart.duration,
      );
    }
    dragRef.current = null;
    setPanning(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const cancelPointer = () => {
    dragRef.current = null;
    setPanning(false);
  };

  const seekWithKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    selectPosition(index + (event.key === 'ArrowRight' ? 1 : -1));
  };

  useEffect(() => {
    if (!expanded) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeExpandedGraph();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [expanded]);

  const renderCurrentMarker = (x: number, compact: boolean) => (
    <>
      <span
        className="pointer-events-none absolute inset-y-0 w-px bg-sky-500/80"
        style={{ left: `${x}%` }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-500 shadow"
        style={{ left: `${x}%`, top: `${Math.max(0, Math.min(100, currentY))}%` }}
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute z-20 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 font-semibold text-white shadow-xl ${
          compact
            ? 'text-[0.6rem] opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100'
            : 'text-xs'
        }`}
        style={{
          left: `${Math.max(compact ? 20 : 10, Math.min(compact ? 80 : 90, x))}%`,
          top: `${Math.max(8, Math.min(88, currentY))}%`,
          transform: `translate(-50%, ${currentY < 30 ? '12px' : 'calc(-100% - 12px)'})`,
        }}
      >
        {formatTooltipTime(current?.fixTime)} · {currentSpeed.toFixed(0)} km/h
      </span>
    </>
  );

  const yTicks = [1, 0.75, 0.5, 0.25, 0];
  const timeTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <>
      <section
        aria-label={t('replaySpeedGraph')}
        className="rounded-3xl border border-(--color-divider) bg-(--color-paper) p-4 shadow-sm shadow-slate-950/5"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold text-(--color-text)">
            <Activity size={15} className="text-violet-600" aria-hidden="true" />
            {t('replaySpeedGraph')}
          </h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[0.65rem] font-semibold text-violet-700 dark:text-violet-300">
              {currentSpeed.toFixed(0)} km/h
            </span>
            {zoom > 1 && (
              <button
                type="button"
                onClick={resetZoom}
                aria-label={t('replaySpeedGraphResetZoom')}
                title={t('replaySpeedGraphResetZoom')}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-(--color-divider) px-2 text-[0.65rem] font-semibold text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                <RotateCcw size={12} aria-hidden="true" /> {zoom.toFixed(1)}×
              </button>
            )}
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={t('replaySpeedGraphExpand')}
              title={t('replaySpeedGraphExpand')}
              className="grid h-8 w-8 place-items-center rounded-lg border border-(--color-divider) text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            >
              <Expand size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="flex h-28 shrink-0 flex-col justify-between text-right text-[0.58rem] text-(--color-muted)">
            <span>{fullChart.scaleMaximum}</span>
            <span>{Math.round(fullChart.scaleMaximum / 2)}</span>
            <span>0</span>
          </div>
          <div
            role="slider"
            tabIndex={0}
            aria-label={t('replaySpeedGraphSeek')}
            aria-valuemin={0}
            aria-valuemax={Math.max(positions.length - 1, 0)}
            aria-valuenow={index}
            aria-valuetext={`${formatTooltipTime(current?.fixTime)}, ${currentSpeed.toFixed(0)} km/h`}
            onKeyDown={seekWithKeyboard}
            onWheel={zoomWithWheel}
            onPointerDown={startPointer}
            onPointerMove={movePointer}
            onPointerUp={endPointer}
            onPointerCancel={cancelPointer}
            className={`group relative h-28 min-w-0 flex-1 touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${panning ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-crosshair'}`}
          >
            <div className="absolute inset-0 overflow-hidden border-b border-l border-(--color-divider) bg-[linear-gradient(to_bottom,var(--color-divider)_1px,transparent_1px)] bg-[length:100%_50%]">
              <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {viewChart.geometry.segments.map((segment, segmentIndex) => (
                  <line
                    key={segmentIndex}
                    x1={segment.x1}
                    y1={segment.y1}
                    x2={segment.x2}
                    y2={segment.y2}
                    stroke={segment.color}
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>
            </div>
            {currentVisibleInView && renderCurrentMarker(viewX, true)}
          </div>
        </div>
        <div className="mt-1.5 ml-6 flex justify-between text-[0.6rem] font-medium text-(--color-muted)">
          <span>{formatTime(viewChart.viewStart, zoom >= 5)}</span>
          <span>{formatTime(viewChart.viewEnd, zoom >= 5)}</span>
        </div>
        <p className="mt-2 text-[0.65rem] leading-4 text-(--color-muted)">
          {t('replaySpeedGraphHint')}
        </p>
      </section>

      <Dialog
        open={expanded}
        onClose={closeExpandedGraph}
        fullWidth
        maxWidth="lg"
        aria-labelledby="replay-speed-graph-dialog-title"
        className="!max-w-5xl rounded-xl"
      >
        <DialogContent className="p-0">
          <section aria-label={t('replaySpeedGraph')} className="overflow-hidden rounded-xl">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-(--color-divider) px-5 py-4 md:px-6">
              <div>
                <h2
                  id="replay-speed-graph-dialog-title"
                  className="flex items-center gap-2 text-base font-semibold text-(--color-text)"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-500/10 text-violet-600">
                    <Activity size={18} aria-hidden="true" />
                  </span>
                  {t('replaySpeedGraph')}
                </h2>
                <p className="mt-1 pl-11 text-xs text-(--color-muted)">
                  {t('replaySpeedGraphModalHint')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                  {currentSpeed.toFixed(0)} km/h
                </span>
                {zoom > 1 && (
                  <button
                    type="button"
                    onClick={resetZoom}
                    title={t('replaySpeedGraphResetZoom')}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-(--color-divider) px-2.5 text-xs font-semibold text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text)"
                  >
                    <RotateCcw size={13} aria-hidden="true" /> {zoom.toFixed(1)}×
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeExpandedGraph}
                  aria-label={t('sharedClose')}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-(--color-divider) text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text)"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-3 gap-px border-b border-(--color-divider) bg-(--color-divider)">
              {[
                [
                  t('replaySpeedGraphVisiblePoints'),
                  viewChart.geometry.visibleCount.toLocaleString(),
                ],
                [t('replaySpeedGraphScale'), `${fullChart.scaleMaximum} km/h`],
                [t('replaySpeedGraphZoom'), `${zoom.toFixed(1)}×`],
              ].map(([label, value]) => (
                <div key={label} className="bg-(--color-paper) px-4 py-2.5 text-center">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-(--color-muted)">
                    {label}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-(--color-text)">{value}</p>
                </div>
              ))}
            </div>

            <div className="px-5 pt-5 pb-4 md:px-6">
              <div className="flex gap-3">
                <div className="flex h-[min(46vh,25rem)] min-h-64 w-10 shrink-0 flex-col justify-between pb-px text-right text-[0.65rem] font-medium text-(--color-muted)">
                  {yTicks.map((tick) => (
                    <span key={tick}>{Math.round(fullChart.scaleMaximum * tick)}</span>
                  ))}
                </div>
                <div className="relative h-[min(46vh,25rem)] min-h-64 min-w-0 flex-1">
                  <div
                    role="slider"
                    tabIndex={0}
                    aria-label={t('replaySpeedGraphSeek')}
                    aria-valuemin={0}
                    aria-valuemax={positions.length - 1}
                    aria-valuenow={index}
                    aria-valuetext={`${formatTooltipTime(current?.fixTime)}, ${currentSpeed.toFixed(0)} km/h`}
                    onKeyDown={seekWithKeyboard}
                    onWheel={zoomWithWheel}
                    onPointerDown={startPointer}
                    onPointerMove={movePointer}
                    onPointerUp={endPointer}
                    onPointerCancel={cancelPointer}
                    className={`absolute inset-0 touch-none select-none overflow-hidden rounded-md border border-(--color-divider) bg-(--color-surface-subtle) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${panning ? 'cursor-grabbing' : zoom > 1 ? 'cursor-grab' : 'cursor-crosshair'}`}
                  >
                    <div className="pointer-events-none absolute inset-0 grid grid-cols-4 grid-rows-4">
                      {Array.from({ length: 16 }, (_, gridIndex) => (
                        <span
                          key={gridIndex}
                          className="border-t border-l border-(--color-divider)/70"
                        />
                      ))}
                    </div>
                    <svg
                      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                      preserveAspectRatio="none"
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      aria-hidden="true"
                    >
                      <defs>
                        <linearGradient id="replay-speed-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(124 58 237)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="rgb(124 58 237)" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={viewChart.geometry.areaPoints}
                        fill="url(#replay-speed-area)"
                      />
                      {viewChart.geometry.segments.map((segment, segmentIndex) => (
                        <line
                          key={segmentIndex}
                          x1={segment.x1}
                          y1={segment.y1}
                          x2={segment.x2}
                          y2={segment.y2}
                          stroke={segment.color}
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                    </svg>
                  </div>
                  {currentVisibleInView && renderCurrentMarker(viewX, false)}
                </div>
              </div>

              <div className="mt-2 ml-13 grid grid-cols-5 text-[0.65rem] font-medium text-(--color-muted)">
                {timeTicks.map((tick, tickIndex) => (
                  <span
                    key={tick}
                    className={
                      tickIndex === 0 ? 'text-left' : tickIndex === 4 ? 'text-right' : 'text-center'
                    }
                  >
                    {formatTime(viewChart.viewStart + viewChart.duration * tick, zoom >= 5)}
                  </span>
                ))}
              </div>

              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--color-divider) bg-(--color-surface-subtle) px-3 py-2 text-[0.68rem] text-(--color-muted)">
                <span className="inline-flex items-center gap-1.5">
                  <ZoomIn size={13} aria-hidden="true" /> {t('replaySpeedGraphWheelHelp')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Hand size={13} aria-hidden="true" /> {t('replaySpeedGraphPanHelp')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MousePointer2 size={13} aria-hidden="true" /> {t('replaySpeedGraphClickHelp')}
                </span>
              </footer>
            </div>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
