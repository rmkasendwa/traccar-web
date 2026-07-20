'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from '@/lib/router';
import { devicesActions } from '@/store';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';
import ThemeModeControl from '@/components/ui/ThemeModeControl';
import LanguageControl from '@/components/ui/LanguageControl';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

dayjs.extend(relativeTime);

const statusStyles: Record<string, string> = {
  online: 'bg-emerald-400 shadow-emerald-400/40',
  offline: 'bg-slate-500',
  unknown: 'bg-amber-400 shadow-amber-400/40',
};

const statusLabel = (device: any, t: (key: string) => string) => {
  if (device.status === 'online') return t('deviceOnlineNow');
  if (device.lastUpdate) {
    return t('deviceUpdatedRelative').replace('{time}', dayjs(device.lastUpdate).fromNow());
  }
  return device.status === 'offline' ? t('deviceStatusOffline') : t('deviceNoRecentUpdate');
};

type DeviceSidebarProps = {
  devices: any[];
  allDevices: any[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (value: string[]) => void;
  mobile?: boolean;
};

const BatteryState = ({ deviceId, selected }: { deviceId: number; selected: boolean }) => {
  const t = useTranslation();
  const position = useSelector((state: any) => state.session.positions[deviceId]);
  const batteryLevel = position?.attributes?.batteryLevel;
  const charging = position?.attributes?.charge;

  if (batteryLevel == null) return null;

  const Icon = charging
    ? BatteryCharging
    : batteryLevel > 75
      ? BatteryFull
      : batteryLevel > 40
        ? BatteryMedium
        : batteryLevel > 15
          ? BatteryLow
          : BatteryWarning;
  const color = selected
    ? 'text-white/90'
    : batteryLevel <= 20
      ? 'text-rose-600 dark:text-rose-400'
      : batteryLevel <= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400';

  const batteryTitle = t('deviceBatteryLevel').replace('{level}', String(Math.round(batteryLevel)));
  const chargingText = t('deviceCharging');

  return (
    <span
      className={`flex shrink-0 items-center gap-1 text-[0.68rem] font-semibold tabular-nums ${color}`}
      title={`${batteryTitle}${charging ? ` · ${chargingText}` : ''}`}
      aria-label={`${t('deviceBatteryLevelA11y').replace('{level}', String(Math.round(batteryLevel)))}${charging ? `, ${chargingText}` : ''}`}
    >
      <Icon size={16} strokeWidth={2} />
      {Math.round(batteryLevel)}%
    </span>
  );
};

export default function DeviceSidebar({
  devices,
  allDevices,
  keyword,
  onKeywordChange,
  statusFilter,
  onStatusFilterChange,
  mobile,
}: DeviceSidebarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const t = useTranslation();
  const selectedId = useSelector((state: any) => state.devices.selectedId);
  const socket = useSelector((state: any) => state.session.socket);
  const [filterOpen, setFilterOpen] = useState(false);
  const [clock, setClock] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setClock((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const toggleStatus = (status: string) => {
    onStatusFilterChange(
      statusFilter.includes(status)
        ? statusFilter.filter((item) => item !== status)
        : [...statusFilter, status],
    );
  };

  return (
    <>
      <header
        className={`border-b border-(--color-divider) bg-linear-to-b from-white to-sky-50/35 px-4 pb-3 dark:from-transparent dark:to-transparent ${mobile ? 'pt-4 pr-14' : 'pt-4'}`}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight">{t('deviceDevices')}</h1>
            <p
              className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${
                socket === false ? 'text-rose-600 dark:text-rose-300' : 'text-(--color-muted)'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  socket === false ? 'bg-rose-400' : 'bg-emerald-400'
                }`}
              />
              {socket === false ? t('deviceStatusReconnecting') : t('deviceLiveTracking')}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageControl placement="bottom-start" />
            <ThemeModeControl compact popover />
          </div>
        </div>

        <div className="flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-(--color-divider) bg-white px-3 text-(--color-muted) shadow-sm transition focus-within:border-sky-400/60 focus-within:ring-2 focus-within:ring-sky-500/10 dark:bg-(--color-surface-subtle) dark:shadow-none">
            <Search size={17} />
            <input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-(--color-text) outline-none placeholder:text-(--color-muted)"
              placeholder={t('deviceSearch')}
              aria-label={t('deviceSearch')}
            />
          </label>
          <FloatingPanel
            open={filterOpen}
            onOpenChange={setFilterOpen}
            className="w-64"
            trigger={(props, ref) => (
              <button
                {...props}
                ref={ref as any}
                type="button"
                className={`relative grid h-10 w-10 place-items-center rounded-xl border transition ${
                  statusFilter.length
                    ? 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-400/50 dark:bg-sky-400/15 dark:text-sky-300'
                    : 'border-(--color-divider) bg-white text-(--color-muted) shadow-sm hover:bg-(--color-surface-hover) dark:bg-(--color-surface-subtle) dark:shadow-none'
                }`}
                aria-label={t('deviceFilter')}
              >
                <SlidersHorizontal size={18} />
                {statusFilter.length > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
                )}
              </button>
            )}
          >
            <div className="px-2 pb-2 pt-1">
              <p className="text-sm font-semibold">{t('deviceStatus')}</p>
              <p className="mt-0.5 text-xs text-(--color-muted)">{t('deviceStatusHint')}</p>
            </div>
            {['online', 'offline', 'unknown'].map((status) => {
              const count = allDevices.filter((device) => device.status === status).length;
              return (
                <label
                  key={status}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-(--color-surface-hover)"
                >
                  <input
                    type="checkbox"
                    checked={statusFilter.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="ui-checkbox h-4 w-4 cursor-pointer"
                  />
                  <span className={`h-2 w-2 rounded-full ${statusStyles[status]}`} />
                  <span className="flex-1 capitalize">
                    {t(`deviceStatus${status[0].toUpperCase()}${status.slice(1)}`)}
                  </span>
                  <span className="text-xs text-(--color-muted)">{count}</span>
                </label>
              );
            })}
            {statusFilter.length > 0 && (
              <button
                type="button"
                onClick={() => onStatusFilterChange([])}
                className="mt-1 w-full rounded-lg px-2 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
              >
                {t('deviceClearFilters')}
              </button>
            )}
          </FloatingPanel>
          <button
            type="button"
            onClick={() => navigate('/settings/device')}
            className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/20 transition hover:bg-sky-400"
            aria-label={t('deviceAdd')}
          >
            <Plus size={19} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 px-2 py-3 [scrollbar-color:#cbd5e1_transparent] dark:bg-transparent dark:[scrollbar-color:#334155_transparent]">
        {devices.length > 0 ? (
          <div role="listbox" aria-label={t('deviceDevices')} className="space-y-1">
            {devices.map((device) => {
              const selected = selectedId === device.id;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  key={device.id}
                  onClick={() => dispatch(devicesActions.selectId(device.id))}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    selected
                      ? 'border border-sky-400 bg-sky-500 text-white shadow-lg shadow-sky-950/20'
                      : 'border border-slate-200/80 bg-white text-(--color-text) shadow-sm shadow-slate-900/3 hover:border-sky-200 hover:bg-sky-50/50 dark:border-transparent dark:bg-transparent dark:shadow-none dark:hover:border-(--color-divider) dark:hover:bg-(--color-surface-hover)'
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      selected
                        ? 'bg-white/15'
                        : 'bg-slate-100 ring-1 ring-slate-200/70 dark:bg-(--color-surface-subtle) dark:ring-transparent'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full shadow-md ${statusStyles[device.status] || statusStyles.unknown}`}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{device.name}</span>
                    <span
                      className={`mt-0.5 block truncate text-xs ${selected ? 'text-sky-100' : 'text-(--color-muted)'}`}
                      suppressHydrationWarning
                    >
                      {statusLabel(device, t)}
                      <time className="sr-only">{clock}</time>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`text-[0.65rem] font-semibold uppercase tracking-wider ${selected ? 'text-white/80' : 'text-(--color-muted)'}`}
                    >
                      {device.category || 'GPS'}
                    </span>
                    <BatteryState deviceId={device.id} selected={selected} />
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full min-h-56 flex-col items-center justify-center px-8 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-(--color-surface-subtle) text-(--color-muted)">
              <Filter size={22} />
            </span>
            <p className="mt-4 text-sm font-semibold text-(--color-text)">
              {allDevices.length ? t('deviceNoMatching') : t('deviceNoDevices')}
            </p>
            <p className="mt-1 text-xs leading-5 text-(--color-muted)">
              {allDevices.length
                ? t('deviceNoMatchingDescription')
                : t('deviceNoDevicesDescription')}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-(--color-divider) bg-white/70 px-5 py-3 text-xs font-medium text-(--color-muted) dark:bg-transparent">
        {t('deviceCount')
          .replace('{count}', String(devices.length))
          .replace('{total}', String(allDevices.length))}
      </div>
    </>
  );
}
