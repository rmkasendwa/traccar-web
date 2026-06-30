'use client';

import { useEffect, useRef, useState } from 'react';

type ReplayTimelineProps = {
  value: number;
  max: number;
  playing: boolean;
  valueText: string;
  onChange: (value: number) => void;
};

export default function ReplayTimeline({
  value,
  max,
  playing,
  valueText,
  onChange,
}: ReplayTimelineProps) {
  const [draftValue, setDraftValue] = useState(value);
  const [focused, setFocused] = useState(false);
  const draggingRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const displayValue = draggingRef.current ? draftValue : value;
  const progress = max > 0 ? (displayValue / max) * 100 : 0;

  useEffect(() => {
    if (!draggingRef.current) setDraftValue(value);
  }, [value]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const updateReplay = (nextValue: number) => {
    setDraftValue(nextValue);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      onChange(nextValue);
      frameRef.current = null;
    });
  };

  return (
    <div className="relative mt-2 h-8 px-2">
      <div className="absolute inset-x-2 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-inner">
        <div
          className="h-full rounded-full bg-linear-to-r from-sky-500 via-cyan-400 to-emerald-400"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        className={`pointer-events-none absolute top-1/2 z-10 grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white bg-sky-500 shadow-md ${
          focused ? 'scale-110 ring-4 ring-sky-200' : ''
        } ${playing ? 'shadow-sky-400/60' : ''}`}
        style={{ left: `calc(0.5rem + (100% - 1rem) * ${progress / 100})` }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={displayValue}
        onPointerDown={() => {
          draggingRef.current = true;
          setDraftValue(value);
        }}
        onPointerUp={(event) => {
          const nextValue = Number(event.currentTarget.value);
          if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
          draggingRef.current = false;
          setDraftValue(nextValue);
          onChange(nextValue);
        }}
        onInput={(event) => updateReplay(Number(event.currentTarget.value))}
        onChange={(event) => updateReplay(Number(event.currentTarget.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          draggingRef.current = false;
          setFocused(false);
        }}
        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
        aria-label="Replay timeline"
        aria-valuetext={valueText}
      />
    </div>
  );
}
