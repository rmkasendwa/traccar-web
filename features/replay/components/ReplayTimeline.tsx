'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

type ReplayTimelineProps = {
  value: number;
  max: number;
  playing: boolean;
  valueText: string;
  getTooltipText: (value: number) => string;
  onChange: (value: number) => void;
};

export default function ReplayTimeline({
  value,
  max,
  playing,
  valueText,
  getTooltipText,
  onChange,
}: ReplayTimelineProps) {
  const t = useTranslation();
  const [draftValue, setDraftValue] = useState(value);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
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
    <div className="group relative h-8 w-full px-1">
      <div className="absolute inset-x-1 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-slate-300/80 transition-all group-hover:h-1.5 group-hover:bg-slate-300 group-focus-within:h-1.5 group-focus-within:bg-slate-300">
        <div
          className="h-full rounded-full bg-slate-400 transition-colors group-hover:bg-sky-600 group-focus-within:bg-sky-600"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        className={`pointer-events-none absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 scale-75 rounded-full border-2 border-white bg-sky-600 opacity-0 shadow-[0_2px_8px_rgba(2,132,199,0.35)] transition group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 ${
          focused ? 'ring-4 ring-sky-200/80' : ''
        } ${playing ? 'ring-2 ring-sky-200/70' : ''}`}
        style={{ left: `calc(0.25rem + (100% - 0.5rem) * ${progress / 100})` }}
      />
      <span
        className={`pointer-events-none absolute bottom-full z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold tabular-nums text-white shadow-lg transition ${
          dragging || focused ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
        }`}
        style={{ left: `calc(0.25rem + (100% - 0.5rem) * ${progress / 100})` }}
        role="tooltip"
      >
        {getTooltipText(displayValue)}
      </span>
      <input
        type="range"
        min={0}
        max={max}
        value={displayValue}
        onPointerDown={() => {
          draggingRef.current = true;
          setDragging(true);
          setDraftValue(value);
        }}
        onPointerUp={(event) => {
          const nextValue = Number(event.currentTarget.value);
          if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
          draggingRef.current = false;
          setDragging(false);
          setDraftValue(nextValue);
          onChange(nextValue);
        }}
        onInput={(event) => updateReplay(Number(event.currentTarget.value))}
        onChange={(event) => updateReplay(Number(event.currentTarget.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          draggingRef.current = false;
          setDragging(false);
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
