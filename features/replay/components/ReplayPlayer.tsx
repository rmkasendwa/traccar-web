'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Gauge, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';
import ReplayMapPlaceholder from '@/features/replay/components/ReplayMapPlaceholder';
import type { ReplayPosition } from '@/features/replay/types';

const ReplayMap = dynamic(() => import('@/features/replay/components/ReplayMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full" aria-label="Loading replay map">
      <ReplayMapPlaceholder />
    </div>
  ),
});

type ReplayPlayerProps = {
  positions: ReplayPosition[];
};

const speeds = [0.5, 1, 2, 4];

export default function ReplayPlayer({ positions }: ReplayPlayerProps) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastIndex = Math.max(positions.length - 1, 0);

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
  const togglePlayback = () => {
    if (index === lastIndex) setIndex(0);
    setPlaying((current) => !current);
  };
  const currentPosition = positions[index];

  return (
    <section className="relative h-full min-h-[24rem] overflow-hidden bg-slate-200">
      <div className="absolute inset-0">
        <ReplayMap
          positions={positions}
          currentPosition={currentPosition}
          onSelectPosition={selectPosition}
        />
      </div>
      {currentPosition && (
        <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl border border-white/70 bg-white/92 px-4 py-3 shadow-2xl shadow-slate-950/20 backdrop-blur-xl md:left-[23.5rem] md:right-4 md:px-5">
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
            <time dateTime={currentPosition.fixTime} className="tabular-nums">
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
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectPosition(index - 1)}
                disabled={index === 0 || playing}
                className="replay-control"
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
                className="replay-control"
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
      )}
    </section>
  );
}
