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

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
        <time dateTime={currentPosition.fixTime} className="tabular-nums" suppressHydrationWarning>
          {new Date(currentPosition.fixTime).toLocaleString()}
        </time>
        <span aria-live="polite" className="tabular-nums">
          {index + 1} / {positions.length}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => selectPosition(index - 1)}
          disabled={index === 0 || playing}
          className="replay-control grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={t('replayPreviousPosition')}
        >
          <SkipBack size={16} fill="currentColor" />
        </button>
        <button
          type="button"
          onClick={togglePlayback}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-900 text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          aria-label={playing ? t('replayPause') : t('replayPlay')}
          aria-pressed={playing}
        >
          {playing ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" className="translate-x-px" />
          )}
        </button>
        <button
          type="button"
          onClick={() => selectPosition(index + 1)}
          disabled={index === lastIndex || playing}
          className="replay-control grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={t('replayNextPosition')}
        >
          <SkipForward size={16} fill="currentColor" />
        </button>

        <div className="min-w-16 flex-1">
          <ReplayTimeline
            value={index}
            max={lastIndex}
            playing={playing}
            onChange={selectPosition}
            valueText={t('replayPositionValue')
              .replace('{position}', String(index + 1))
              .replace('{total}', String(positions.length))
              .replace('{time}', new Date(currentPosition.fixTime).toLocaleString())}
          />
        </div>

        <details ref={speedMenuRef} className="group relative shrink-0">
          <summary
            className="grid h-8 min-w-10 cursor-pointer list-none place-items-center rounded-lg px-2 text-xs font-bold tabular-nums text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 [&::-webkit-details-marker]:hidden"
            aria-label={`${t('replayPlaybackSpeed')}: ${speed}×`}
          >
            {speed}×
          </summary>
          <div
            className="absolute right-0 bottom-full z-30 mb-2 w-32 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"
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
                    ? 'bg-sky-50 text-sky-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
