'use client';

import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';

type ReplayDateTimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dateOnly?: boolean;
};

const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const dateValue = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export default function ReplayDateTimePicker({
  label,
  value,
  onChange,
  dateOnly = false,
}: ReplayDateTimePickerProps) {
  const [date = '', time = '00:00'] = value.split('T');
  const selectedDate = useMemo(() => parseDate(date), [date]);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1)),
  );
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 10 }), shift({ padding: 10 })],
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  useEffect(() => {
    if (!open)
      setVisibleMonth(
        new Date(Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), 1)),
      );
  }, [open, selectedDate]);

  const year = visibleMonth.getUTCFullYear();
  const month = visibleMonth.getUTCMonth();
  const leadingDays = visibleMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells = Array.from({ length: leadingDays + daysInMonth }, (_, index) =>
    index < leadingDays ? null : index - leadingDays + 1,
  );
  const today = new Date();

  const chooseDate = (day: number) => {
    onChange(`${dateValue(year, month, day)}T${time || '00:00'}`);
    setOpen(false);
  };

  const moveMonth = (offset: number) => {
    setVisibleMonth(
      (current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + offset, 1)),
    );
  };

  return (
    <fieldset className="relative rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
      <legend className="px-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </legend>
      <div className={dateOnly ? 'block' : 'grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2'}>
        <button
          ref={refs.setReference}
          type="button"
          className="flex h-9 min-w-0 items-center gap-2 rounded-lg bg-slate-50 px-2.5 text-left text-xs font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
          aria-haspopup="dialog"
          aria-expanded={open}
          {...getReferenceProps()}
        >
          <CalendarDays size={15} className="shrink-0 text-sky-600" aria-hidden="true" />
          <span className="truncate">
            {selectedDate.toLocaleDateString('en', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              timeZone: 'UTC',
            })}
          </span>
        </button>
        {!dateOnly && (
          <label className="relative min-w-0">
            <span className="sr-only">{label} time in UTC</span>
            <Clock3
              size={14}
              className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="time"
              value={time}
              onChange={(event) => onChange(`${date}T${event.target.value}`)}
              required
              className="h-9 w-full min-w-0 rounded-lg bg-slate-50 pr-1 pl-7 text-xs font-semibold text-slate-800 outline-none transition hover:bg-slate-100 focus:bg-sky-50"
            />
          </label>
        )}
      </div>
      <p className="mt-1.5 px-1 text-[0.62rem] font-medium text-slate-400">
        {dateOnly ? 'Full local day' : 'UTC timezone'}
      </p>

      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              aria-label={`${label} calendar`}
              className="z-100 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/20 outline-none"
              {...getFloatingProps()}
            >
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-500"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={17} aria-hidden="true" />
                </button>
                <p className="text-sm font-bold text-slate-900">
                  {visibleMonth.toLocaleDateString('en', {
                    month: 'long',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </p>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-sky-500"
                  aria-label="Next month"
                >
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1" aria-hidden="true">
                {weekdays.map((weekday) => (
                  <span
                    key={weekday}
                    className="grid h-7 place-items-center text-[0.62rem] font-bold uppercase text-slate-400"
                  >
                    {weekday}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, index) => {
                  if (!day) return <span key={`empty-${index}`} className="h-8" />;
                  const selected =
                    selectedDate.getUTCFullYear() === year &&
                    selectedDate.getUTCMonth() === month &&
                    selectedDate.getUTCDate() === day;
                  const isToday =
                    today.getUTCFullYear() === year &&
                    today.getUTCMonth() === month &&
                    today.getUTCDate() === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => chooseDate(day)}
                      className={`grid h-8 place-items-center rounded-lg text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-500 ${
                        selected
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                          : 'text-slate-600 hover:bg-sky-50 hover:text-sky-800'
                      } ${isToday && !selected ? 'ring-1 ring-sky-300' : ''}`}
                      aria-label={new Date(Date.UTC(year, month, day)).toLocaleDateString('en', {
                        dateStyle: 'full',
                        timeZone: 'UTC',
                      })}
                      aria-pressed={selected}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </fieldset>
  );
}
