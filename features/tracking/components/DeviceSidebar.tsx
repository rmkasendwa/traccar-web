'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Battery,
  BatteryCharging,
  BatteryLow,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from '@/lib/router';
import { devicesActions } from '@/store';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';

dayjs.extend(relativeTime);

const statusStyles: Record<string, string> = {
  online: 'bg-emerald-400 shadow-emerald-400/40',
  offline: 'bg-slate-500',
  unknown: 'bg-amber-400 shadow-amber-400/40',
};

const statusLabel = (device: any) => {
  if (device.status === 'online') return 'Online now';
  if (device.lastUpdate) return `Updated ${dayjs(device.lastUpdate).fromNow()}`;
  return device.status === 'offline' ? 'Offline' : 'No recent update';
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
  const position = useSelector((state: any) => state.session.positions[deviceId]);
  const batteryLevel = position?.attributes?.batteryLevel;
  const charging = position?.attributes?.charge;

  if (batteryLevel == null) return null;

  const Icon = charging ? BatteryCharging : batteryLevel <= 20 ? BatteryLow : Battery;
  const color = selected
    ? 'text-white/90'
    : batteryLevel <= 20
      ? 'text-rose-400'
      : batteryLevel <= 50
        ? 'text-amber-400'
        : 'text-emerald-400';

  return (
    <span
      className={`flex shrink-0 items-center gap-1 text-[0.68rem] font-semibold tabular-nums ${color}`}
      title={`Battery level: ${Math.round(batteryLevel)}%${charging ? ' · charging' : ''}`}
      aria-label={`Battery level ${Math.round(batteryLevel)} percent${charging ? ', charging' : ''}`}
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
      <header className={`border-b border-white/10 px-5 pb-4 ${mobile ? 'pt-5 pr-14' : 'pt-5'}`}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-sky-400">
              Live tracking
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">Your devices</h1>
          </div>
          <span
            className={`flex items-center gap-2 rounded-full px-2.5 py-1 text-xs ${
              socket === false
                ? 'bg-rose-500/15 text-rose-300'
                : 'bg-emerald-400/10 text-emerald-300'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${socket === false ? 'bg-rose-400' : 'bg-emerald-400'}`}
            />
            {socket === false ? 'Reconnecting' : 'Live'}
          </span>
        </div>

        <div className="flex gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-3 text-slate-300 transition focus-within:border-sky-400/60 focus-within:bg-white/10">
            <Search size={17} />
            <input
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Search devices"
              aria-label="Search devices"
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
                className={`relative grid h-11 w-11 place-items-center rounded-xl border transition ${
                  statusFilter.length
                    ? 'border-sky-400/50 bg-sky-400/15 text-sky-300'
                    : 'border-white/10 bg-white/[0.07] text-slate-300 hover:bg-white/10'
                }`}
                aria-label="Filter devices"
              >
                <SlidersHorizontal size={18} />
                {statusFilter.length > 0 && (
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-sky-400" />
                )}
              </button>
            )}
          >
            <div className="px-2 pb-2 pt-1">
              <p className="text-sm font-semibold">Device status</p>
              <p className="mt-0.5 text-xs text-slate-500">Show one or more states</p>
            </div>
            {['online', 'offline', 'unknown'].map((status) => {
              const count = allDevices.filter((device) => device.status === status).length;
              return (
                <label
                  key={status}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-slate-100"
                >
                  <input
                    type="checkbox"
                    checked={statusFilter.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="h-4 w-4 accent-sky-600"
                  />
                  <span className={`h-2 w-2 rounded-full ${statusStyles[status]}`} />
                  <span className="flex-1 capitalize">{status}</span>
                  <span className="text-xs text-slate-400">{count}</span>
                </label>
              );
            })}
            {statusFilter.length > 0 && (
              <button
                type="button"
                onClick={() => onStatusFilterChange([])}
                className="mt-1 w-full rounded-lg px-2 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
              >
                Clear filters
              </button>
            )}
          </FloatingPanel>
          <button
            type="button"
            onClick={() => navigate('/settings/device')}
            className="grid h-11 w-11 place-items-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            aria-label="Add device"
          >
            <Plus size={19} />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3 [scrollbar-color:#334155_transparent]">
        {devices.length > 0 ? (
          <div role="listbox" aria-label="Devices" className="space-y-1">
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
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-950/20'
                      : 'text-slate-200 hover:bg-white/[0.07]'
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      selected ? 'bg-white/15' : 'bg-white/[0.07]'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full shadow-md ${statusStyles[device.status] || statusStyles.unknown}`}
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{device.name}</span>
                    <span
                      className={`mt-0.5 block truncate text-xs ${selected ? 'text-sky-100' : 'text-slate-400'}`}
                    >
                      {statusLabel(device)}
                      <span className="sr-only">{clock}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`text-[0.65rem] font-semibold uppercase tracking-wider ${selected ? 'text-white/80' : 'text-slate-500'}`}
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
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.07] text-slate-400">
              <Filter size={22} />
            </span>
            <p className="mt-4 text-sm font-semibold text-white">
              {allDevices.length ? 'No matching devices' : 'No devices yet'}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {allDevices.length
                ? 'Try another search or clear the active status filters.'
                : 'Add your first tracker to see it here and on the map.'}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">
        {devices.length} of {allDevices.length} devices
      </div>
    </>
  );
}
