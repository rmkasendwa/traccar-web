'use client';

import { useEffect, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Search } from 'lucide-react';
import SelectField from '@/components/ui/SelectField';
import ReplayDateTimePicker from '@/features/replay/components/ReplayDateTimePicker';
import type { ReplayDevice } from '@/features/replay/types';
import { routes } from '@/lib/routes';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

type Period =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'previousWeek'
  | 'thisMonth'
  | 'previousMonth'
  | 'specificDay'
  | 'custom';

const periods: { value: Period; labelKey: string }[] = [
  { value: 'today', labelKey: 'replayToday' },
  { value: 'yesterday', labelKey: 'replayYesterday' },
  { value: 'thisWeek', labelKey: 'replayThisWeek' },
  { value: 'previousWeek', labelKey: 'replayPreviousWeek' },
  { value: 'thisMonth', labelKey: 'replayThisMonth' },
  { value: 'previousMonth', labelKey: 'replayPreviousMonth' },
  { value: 'specificDay', labelKey: 'replayChooseDay' },
  { value: 'custom', labelKey: 'replayCustomRange' },
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
  initialDay?: string;
  initialCustomFrom: string;
  initialCustomTo: string;
};

export default function ReplayFilterPanel({
  devices,
  deviceId,
  initialFrom,
  initialTo,
  initialPeriod,
  initialDay,
  initialCustomFrom,
  initialCustomTo,
}: ReplayFilterPanelProps) {
  const t = useTranslation();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedDevice, setSelectedDevice] = useState(deviceId);
  const [period, setPeriod] = useState<Period>(() => {
    if (periods.some((item) => item.value === initialPeriod)) return initialPeriod as Period;
    return initialFrom && initialTo ? 'custom' : 'today';
  });
  const [customFrom, setCustomFrom] = useState(initialCustomFrom);
  const [customTo, setCustomTo] = useState(initialCustomTo);
  const [selectedDay, setSelectedDay] = useState(initialDay || initialCustomFrom.slice(0, 10));
  const [dirty, setDirty] = useState(!initialFrom || !initialTo);

  useEffect(() => {
    setSelectedDevice(deviceId);
    setPeriod(
      periods.some((item) => item.value === initialPeriod)
        ? (initialPeriod as Period)
        : initialFrom && initialTo
          ? 'custom'
          : 'today',
    );
    setCustomFrom(initialCustomFrom);
    setCustomTo(initialCustomTo);
    setSelectedDay(initialDay || initialCustomFrom.slice(0, 10));
    setDirty(!initialFrom || !initialTo);
  }, [
    deviceId,
    initialCustomFrom,
    initialCustomTo,
    initialDay,
    initialFrom,
    initialPeriod,
    initialTo,
  ]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedDevice) return;
    let from;
    let to;
    if (period === 'specificDay') {
      from = new Date(`${selectedDay}T00:00:00`);
      to = endOfDay(new Date(from));
    } else if (period === 'custom') {
      from = new Date(`${customFrom}Z`);
      to = new Date(`${customTo}Z`);
    } else {
      [from, to] = rangeFor(period);
    }
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;

    const query = new URLSearchParams({
      deviceId: selectedDevice,
      from: from.toISOString(),
      to: to.toISOString(),
      period,
    });
    if (period === 'specificDay') query.set('day', selectedDay);
    startTransition(() => router.push(`${routes.replay.index}?${query}`));
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-1.5">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
          {t('replayDevice')}
        </span>
        <SelectField
          fullWidth
          data={devices}
          value={selectedDevice}
          keyGetter={(device: ReplayDevice) => String(device.id)}
          titleGetter={(device: ReplayDevice) => device.name}
          placeholder={t('replaySelectDevice')}
          onChange={(event: { target: { value: string } }) => {
            setSelectedDevice(event.target.value);
            setDirty(true);
          }}
        />
      </div>

      <fieldset>
        <legend className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-(--color-muted)">
          <CalendarDays size={14} aria-hidden="true" /> {t('replayPeriod')}
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {periods.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setPeriod(item.value);
                setDirty(true);
              }}
              className={`rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                period === item.value
                  ? 'border-sky-300 bg-sky-50 text-sky-800 shadow-sm dark:border-sky-700 dark:bg-sky-950 dark:text-sky-200'
                  : 'border-(--color-divider) bg-(--color-paper) text-(--color-muted) hover:bg-(--color-surface-hover) hover:text-(--color-text)'
              } ${item.value === 'custom' || item.value === 'specificDay' ? 'col-span-2 text-center' : ''}`}
              aria-pressed={period === item.value}
            >
              {t(item.labelKey)}
            </button>
          ))}
        </div>
      </fieldset>

      {period === 'specificDay' && (
        <ReplayDateTimePicker
          label={t('replayDate')}
          value={`${selectedDay}T00:00`}
          dateOnly
          onChange={(value) => {
            setSelectedDay(value.slice(0, 10));
            setDirty(true);
          }}
        />
      )}

      {period === 'custom' && (
        <div className="grid gap-2">
          <ReplayDateTimePicker
            label={t('reportFrom')}
            value={customFrom}
            onChange={(value) => {
              setCustomFrom(value);
              setDirty(true);
            }}
          />
          <ReplayDateTimePicker
            label={t('reportTo')}
            value={customTo}
            onChange={(value) => {
              setCustomTo(value);
              setDirty(true);
            }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={!selectedDevice || pending}
        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
          dirty
            ? 'bg-amber-400 text-amber-950 shadow-amber-500/20 hover:bg-amber-300'
            : 'bg-(--color-text) text-(--color-paper) shadow-slate-950/15 hover:bg-sky-700'
        }`}
      >
        <Search size={16} aria-hidden="true" />
        {pending ? t('replayLoadingRoute') : t('replayLoad')}
      </button>
    </form>
  );
}
