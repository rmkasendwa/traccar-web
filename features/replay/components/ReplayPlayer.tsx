'use client';

import ReplayMapPlaceholder from '@/features/replay/components/ReplayMapPlaceholder';
import type { ReplayPosition } from '@/features/replay/types';
import { Gauge, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
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

const ReplayMap = dynamic(() => import('@/features/replay/components/ReplayMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full" aria-label="Loading replay map">
      <ReplayMapPlaceholder />
    </div>
  ),
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

      <label htmlFor="replay-progress" className="sr-only">
        Replay timeline
      </label>
      <input
        id="replay-progress"
        type="range"
        min={0}
        max={lastIndex}
        value={index}
        onChange={(event) => selectPosition(Number(event.target.value))}
        className="mt-3 h-2 w-full cursor-pointer accent-sky-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
        aria-valuetext={`Position ${index + 1} of ${positions.length}, ${new Date(currentPosition.fixTime).toLocaleString()}`}
      />

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => selectPosition(index - 1)}
            disabled={index === 0 || playing}
            className="replay-control rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous position"
          >
            <RotateCcw size={18} />
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            className="grid h-11 w-11 place-items-center rounded-full bg-slate-900 text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
            aria-label={playing ? 'Pause replay' : 'Play replay'}
            aria-pressed={playing}
          >
            {playing ? (
              <Pause size={19} fill="currentColor" />
            ) : (
              <Play size={19} fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={() => selectPosition(index + 1)}
            disabled={index === lastIndex || playing}
            className="replay-control rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next position"
          >
            <RotateCw size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2" aria-label="Playback speed">
          <Gauge size={16} className="text-slate-400" aria-hidden="true" />
          {speeds.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 ${
                speed === value
                  ? 'bg-sky-100 text-sky-800'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
              aria-pressed={speed === value}
              aria-label={`${value} times playback speed`}
            >
              {value}×
            </button>
          ))}
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
