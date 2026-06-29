'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Search } from 'lucide-react';
import type { ReplayDevice } from '@/features/replay/types';

type Period =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'previousWeek'
  | 'thisMonth'
  | 'previousMonth'
  | 'custom';

const periods: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This week' },
  { value: 'previousWeek', label: 'Previous week' },
  { value: 'thisMonth', label: 'This month' },
  { value: 'previousMonth', label: 'Previous month' },
  { value: 'custom', label: 'Custom range' },
];

const endOfDay = (date: Date) => {
  date.setHours(23, 59, 59, 999);
  return date;
};

const rangeFor = (period: Period): [Date, Date] => {
  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);

  if (period === 'today') {
    from.setHours(0, 0, 0, 0);
    return [from, endOfDay(to)];
  }
  if (period === 'yesterday') {
    from.setDate(from.getDate() - 1);
    to.setDate(to.getDate() - 1);
    from.setHours(0, 0, 0, 0);
    return [from, endOfDay(to)];
  }
  if (period === 'thisWeek' || period === 'previousWeek') {
    const offset = from.getDay() + (period === 'previousWeek' ? 7 : 0);
    from.setDate(from.getDate() - offset);
    from.setHours(0, 0, 0, 0);
    to.setTime(from.getTime());
    to.setDate(to.getDate() + 6);
    return [from, endOfDay(to)];
  }

  const monthOffset = period === 'previousMonth' ? -1 : 0;
  from.setMonth(from.getMonth() + monthOffset, 1);
  from.setHours(0, 0, 0, 0);
  to.setFullYear(from.getFullYear(), from.getMonth() + 1, 0);
  return [from, endOfDay(to)];
};

type ReplayFilterPanelProps = {
  devices: ReplayDevice[];
  deviceId: string;
  initialFrom?: string;
  initialTo?: string;
  initialPeriod?: string;
  initialCustomFrom: string;
  initialCustomTo: string;
};

export default function ReplayFilterPanel({
  devices,
  deviceId,
  initialFrom,
  initialTo,
  initialPeriod,
  initialCustomFrom,
  initialCustomTo,
}: ReplayFilterPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedDevice, setSelectedDevice] = useState(deviceId);
  const [period, setPeriod] = useState<Period>(() => {
    if (periods.some((item) => item.value === initialPeriod)) return initialPeriod as Period;
    return initialFrom && initialTo ? 'custom' : 'today';
  });
  const [customFrom, setCustomFrom] = useState(initialCustomFrom);
  const [customTo, setCustomTo] = useState(initialCustomTo);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDevice) return;
    const [from, to] =
      period === 'custom'
        ? [new Date(`${customFrom}Z`), new Date(`${customTo}Z`)]
        : rangeFor(period);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;

    const query = new URLSearchParams({
      deviceId: selectedDevice,
      from: from.toISOString(),
      to: to.toISOString(),
      period,
    });
    startTransition(() => router.push(`/replay?${query}`));
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="grid gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
        Device
        <select
          value={selectedDevice}
          onChange={(event) => setSelectedDevice(event.target.value)}
          required
          className="h-11 min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
        >
          <option value="" disabled>
            Select a device
          </option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <CalendarDays size={14} aria-hidden="true" /> Replay period
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {periods.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPeriod(item.value)}
              className={`rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                period === item.value
                  ? 'border-sky-300 bg-sky-50 text-sky-800 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              } ${item.value === 'custom' ? 'col-span-2 text-center' : ''}`}
              aria-pressed={period === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      {period === 'custom' && (
        <div className="grid grid-cols-2 gap-2">
          <label className="grid min-w-0 gap-1 text-xs font-medium text-slate-500">
            From (UTC)
            <input
              type="datetime-local"
              value={customFrom}
              onChange={(event) => setCustomFrom(event.target.value)}
              required
              className="h-10 min-w-0 rounded-lg border border-slate-200 px-2 text-xs text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="grid min-w-0 gap-1 text-xs font-medium text-slate-500">
            To (UTC)
            <input
              type="datetime-local"
              value={customTo}
              onChange={(event) => setCustomTo(event.target.value)}
              required
              className="h-10 min-w-0 rounded-lg border border-slate-200 px-2 text-xs text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedDevice || pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        <Search size={16} aria-hidden="true" />
        {pending ? 'Loading route…' : 'Load replay'}
      </button>
    </form>
  );
}
