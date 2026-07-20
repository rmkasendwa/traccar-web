'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

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
  const t = useTranslation();
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
      <div className="absolute inset-x-2 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200 shadow-inner">
        <div className="h-full rounded-full bg-sky-600" style={{ width: `${progress}%` }} />
      </div>
      <div
        className={`pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-sky-600 shadow-[0_2px_8px_rgba(2,132,199,0.35)] ${
          focused ? 'scale-110 ring-4 ring-sky-200/80' : ''
        } ${playing ? 'ring-2 ring-sky-200/70' : ''}`}
        style={{ left: `calc(0.5rem + (100% - 1rem) * ${progress / 100})` }}
      />
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
        aria-label={t('replayTimeline')}
        aria-valuetext={valueText}
        suppressHydrationWarning
      />
    </div>
  );
}
