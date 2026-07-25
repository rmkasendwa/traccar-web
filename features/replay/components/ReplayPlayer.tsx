'use client';

import ReplayMapPlaceholder from '@/features/replay/components/ReplayMapPlaceholder';
import ReplayTimeline from '@/features/replay/components/ReplayTimeline';
import type { ReplayPosition } from '@/features/replay/types';
import { Check, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import dynamic from 'next/dynamic';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const ReplayMapLoading = () => {
  const t = useTranslation();
  return (
    <div className="h-full" aria-label={t('replayLoadingMap')}>
      <ReplayMapPlaceholder />
    </div>
  );
};

const ReplayMap = dynamic(() => import('@/features/replay/components/ReplayMap'), {
  ssr: false,
  loading: ReplayMapLoading,
});

type ReplayState = {
  positions: ReplayPosition[];
  index: number;
  playing: boolean;
  speed: number;
  lastIndex: number;
  currentPosition?: ReplayPosition;
  selectPosition: (nextIndex: number) => void;
  togglePlayback: () => void;
  setSpeed: (value: number) => void;
};

const ReplayContext = createContext<ReplayState | null>(null);

export const useReplayState = () => {
  const context = useContext(ReplayContext);
  if (!context) {
    throw new Error('useReplayState must be used within ReplayProvider');
  }
  return context;
};

type ReplayProviderProps = {
  positions: ReplayPosition[];
  children: ReactNode;
};

const speeds = [0.5, 1, 2, 4];

const formatReplayDuration = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
};

function ControlTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group/tooltip relative shrink-0">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:opacity-100 dark:bg-slate-100 dark:text-slate-900"
      >
        {label}
      </span>
    </span>
  );
}

export function ReplayProvider({ positions, children }: ReplayProviderProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIndex = useMemo(() => Math.max(positions.length - 1, 0), [positions.length]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => {
    stopTimer();
    if (!playing) return undefined;

    timerRef.current = setInterval(() => {
      setIndex((current) => {
        if (current >= lastIndex) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 600 / speed);

    return stopTimer;
  }, [lastIndex, playing, speed, stopTimer]);

  const selectPosition = useCallback(
    (nextIndex: number) => setIndex(Math.max(0, Math.min(lastIndex, nextIndex))),
    [lastIndex],
  );

  const togglePlayback = useCallback(() => {
    setIndex((current) => (current === lastIndex ? 0 : current));
    setPlaying((current) => !current);
  }, [lastIndex]);

  const currentPosition = positions[index];

  return (
    <ReplayContext.Provider
      value={{
        positions,
        index,
        playing,
        speed,
        lastIndex,
        currentPosition,
        selectPosition,
        togglePlayback,
        setSpeed,
      }}
    >
      {children}
    </ReplayContext.Provider>
  );
}

export function ReplayMapView() {
  const { positions, currentPosition, selectPosition } = useReplayState();

  return (
    <div className="relative h-full min-h-96 overflow-hidden bg-slate-200">
      <ReplayMap
        positions={positions}
        currentPosition={currentPosition}
        onSelectPosition={selectPosition}
      />
    </div>
  );
}

export function ReplayControls() {
  const t = useTranslation();
  const speedMenuRef = useRef<HTMLDetailsElement>(null);
  const {
    positions,
    index,
    currentPosition,
    lastIndex,
    playing,
    speed,
    selectPosition,
    togglePlayback,
    setSpeed,
  } = useReplayState();

  useEffect(() => {
    const closeSpeedMenu = (event: PointerEvent | KeyboardEvent) => {
      if (event.type === 'keydown' && (event as KeyboardEvent).key !== 'Escape') {
        return;
      }
      if (event.type === 'pointerdown' && speedMenuRef.current?.contains(event.target as Node)) {
        return;
      }
      speedMenuRef.current?.removeAttribute('open');
    };

    document.addEventListener('pointerdown', closeSpeedMenu);
    document.addEventListener('keydown', closeSpeedMenu);
    return () => {
      document.removeEventListener('pointerdown', closeSpeedMenu);
      document.removeEventListener('keydown', closeSpeedMenu);
    };
  }, []);

  if (!currentPosition) {
    return null;
  }

  const startTime = new Date(positions[0].fixTime).getTime();
  const elapsedTime = new Date(currentPosition.fixTime).getTime() - startTime;
  const totalTime = new Date(positions[lastIndex].fixTime).getTime() - startTime;
  const playbackLabel = playing ? t('replayPause') : t('replayPlay');

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        <time dateTime={currentPosition.fixTime} className="tabular-nums" suppressHydrationWarning>
          {new Date(currentPosition.fixTime).toLocaleString()}
        </time>
        <span aria-live="polite" className="tabular-nums">
          {index + 1} / {positions.length}
        </span>
      </div>

      <div className="mt-2 rounded-2xl border border-slate-200/80 bg-slate-50/85 px-2.5 py-2 shadow-[0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/85 dark:shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="relative flex h-10 items-center justify-center">
          <div className="flex items-center gap-1">
            <ControlTooltip label={t('replayPreviousPosition')}>
              <button
                type="button"
                onClick={() => selectPosition(index - 1)}
                disabled={index === 0 || playing}
                className="replay-control grid h-8 w-8 place-items-center text-slate-500 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-500 dark:hover:text-slate-100"
                aria-label={t('replayPreviousPosition')}
              >
                <SkipBack size={17} fill="currentColor" />
              </button>
            </ControlTooltip>
            <ControlTooltip label={playbackLabel}>
              <button
                type="button"
                onClick={togglePlayback}
                className="mx-1 grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-white shadow-md transition hover:scale-105 hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-sky-400"
                aria-label={playbackLabel}
                aria-pressed={playing}
              >
                {playing ? (
                  <Pause size={17} fill="currentColor" />
                ) : (
                  <Play size={17} fill="currentColor" className="translate-x-px" />
                )}
              </button>
            </ControlTooltip>
            <ControlTooltip label={t('replayNextPosition')}>
              <button
                type="button"
                onClick={() => selectPosition(index + 1)}
                disabled={index === lastIndex || playing}
                className="replay-control grid h-8 w-8 place-items-center text-slate-500 transition-colors hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-35 dark:text-slate-500 dark:hover:text-slate-100"
                aria-label={t('replayNextPosition')}
              >
                <SkipForward size={17} fill="currentColor" />
              </button>
            </ControlTooltip>
          </div>

          <details
            ref={speedMenuRef}
            className="group absolute top-1 right-0 shrink-0 border-l border-slate-200 pl-2 dark:border-slate-700"
          >
            <summary
              className="peer grid h-8 min-w-10 cursor-pointer list-none place-items-center rounded-lg px-2 text-xs font-bold tabular-nums text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white [&::-webkit-details-marker]:hidden"
              aria-label={`${t('replayPlaybackSpeed')}: ${speed}×`}
            >
              {speed}×
            </summary>
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 bottom-full z-40 mb-2 translate-y-1 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-lg transition peer-hover:translate-y-0 peer-hover:opacity-100 peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100 group-open:hidden dark:bg-slate-100 dark:text-slate-900"
            >
              {t('replayPlaybackSpeed')}
            </span>
            <div
              className="absolute right-0 bottom-full z-30 mb-2 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
              role="menu"
              aria-label={t('replayPlaybackSpeed')}
            >
              {speeds.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={speed === value}
                  onClick={() => {
                    setSpeed(value);
                    speedMenuRef.current?.removeAttribute('open');
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
                    speed === value
                      ? 'bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                  aria-label={t('replayPlaybackSpeedValue').replace('{value}', String(value))}
                >
                  <span>{value}×</span>
                  {speed === value && <Check size={14} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </details>
        </div>

        <div className="grid grid-cols-[4rem_minmax(0,1fr)_4rem] items-center">
          <span className="pr-1 text-right text-[10px] font-semibold tabular-nums text-slate-600 dark:text-slate-300">
            {formatReplayDuration(elapsedTime)}
          </span>
          <ReplayTimeline
            value={index}
            max={lastIndex}
            playing={playing}
            onChange={selectPosition}
            valueText={t('replayPositionValue')
              .replace('{position}', String(index + 1))
              .replace('{total}', String(positions.length))
              .replace('{time}', new Date(currentPosition.fixTime).toLocaleString())}
            getTooltipText={(nextIndex) =>
              formatReplayDuration(new Date(positions[nextIndex].fixTime).getTime() - startTime)
            }
          />
          <span className="pl-1 text-left text-[10px] font-semibold tabular-nums text-slate-400 dark:text-slate-500">
            {formatReplayDuration(totalTime)}
          </span>
        </div>
      </div>
    </div>
  );
}

type ReplayPlayerProps = {
  positions: ReplayPosition[];
  children?: ReactNode;
};

export default function ReplayPlayer({ positions, children }: ReplayPlayerProps) {
  return <ReplayProvider positions={positions}>{children ?? <ReplayMapView />}</ReplayProvider>;
}
