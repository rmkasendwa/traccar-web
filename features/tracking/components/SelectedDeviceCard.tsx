'use client';

import { useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import {
  ArrowUpRight,
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Clock3,
  Ellipsis,
  ExternalLink,
  Gauge,
  MapPinned,
  Navigation,
  Pencil,
  Route,
  Send,
  Share2,
  Video,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from '@/lib/router';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { useDeviceReadonly, useRestriction } from '@/lib/permissions';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';

dayjs.extend(relativeTime);

type SelectedDeviceCardProps = {
  deviceId: number;
  position?: any;
  onClose: () => void;
};

const ActionButton = ({
  label,
  onClick,
  disabled,
  tone,
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  tone: 'violet' | 'sky' | 'amber';
  children: ReactNode;
}) => {
  const tones = {
    violet: {
      button: 'hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700',
      icon: 'bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
    },
    sky: {
      button: 'hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700',
      icon: 'bg-sky-100 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
    },
    amber: {
      button: 'hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700',
      icon: 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-1.5 py-2.5 text-[0.68rem] font-semibold text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 ${tones.button}`}
      aria-label={label}
      title={label}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl shadow-inner transition duration-200 ${tones.icon}`}
      >
        {children}
      </span>
      <span className="w-full truncate text-center">{label}</span>
    </button>
  );
};

const Metric = ({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5">
    <div className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
      {icon}
      {label}
    </div>
    <p
      className={`mt-1 truncate text-sm font-semibold ${accent ? 'text-emerald-600' : 'text-slate-800'}`}
    >
      {value}
    </p>
  </div>
);

export default function SelectedDeviceCard({
  deviceId,
  position,
  onClose,
}: SelectedDeviceCardProps) {
  const navigate = useNavigate();
  const device = useSelector((state: any) => state.devices.items[deviceId]);
  const user = useSelector((state: any) => state.session.user);
  const shareDisabled = useSelector((state: any) => state.session.server.attributes.disableShare);
  const readonly = useRestriction('readonly');
  const deviceReadonly = useDeviceReadonly();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!device) return null;

  const batteryLevel = position?.attributes?.batteryLevel;
  const charging = position?.attributes?.charge;
  const BatteryIcon = charging
    ? BatteryCharging
    : batteryLevel > 75
      ? BatteryFull
      : batteryLevel > 40
        ? BatteryMedium
        : batteryLevel > 15
          ? BatteryLow
          : BatteryWarning;
  const statusOnline = device.status === 'online';
  const statusColor = statusOnline
    ? 'bg-emerald-400 shadow-emerald-400/40'
    : device.status === 'offline'
      ? 'bg-slate-400'
      : 'bg-amber-400 shadow-amber-400/40';

  const createGeofence = async () => {
    if (!position) return;
    const response = await fetchOrThrow('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Geofence',
        area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
      }),
    });
    const geofence = await response.json();
    await fetchOrThrow('/api/permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, geofenceId: geofence.id }),
    });
    setMoreOpen(false);
    navigate(`/settings/geofence/${geofence.id}`);
  };

  return (
    <section className="absolute bottom-24 left-1/2 z-20 w-[min(calc(100%-1.5rem),25rem)] -translate-x-1/2 overflow-hidden rounded-[1.4rem] border border-white/50 bg-white/97 text-slate-900 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] backdrop-blur-xl md:bottom-5 md:left-[calc(50%+11rem)]">
      <header className="relative overflow-hidden bg-slate-950 px-4 pb-4 pt-3.5 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(14,165,233,0.32),transparent_48%)]" />
        <div className="relative flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-sky-300 shadow-inner">
            <Navigation size={20} fill="currentColor" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="truncate text-base font-semibold tracking-tight">{device.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.7rem] text-slate-300">
              <span className="flex items-center gap-1.5 capitalize">
                <span className={`h-2 w-2 rounded-full shadow-md ${statusColor}`} />
                {device.status || 'Unknown'}
              </span>
              {batteryLevel != null && (
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-slate-200">
                  <BatteryIcon size={13} />
                  {Math.round(batteryLevel)}%{charging ? ' · charging' : ''}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close device details"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="p-3.5 pb-3">
        <div className="grid grid-cols-3 gap-2">
          <Metric
            icon={<Clock3 size={12} />}
            label="Updated"
            value={device.lastUpdate ? dayjs(device.lastUpdate).fromNow() : 'No update'}
            accent={statusOnline}
          />
          <Metric
            icon={<Gauge size={12} />}
            label="Speed"
            value={position?.speed != null ? `${Math.round(position.speed)} kn` : '—'}
          />
          <Metric
            icon={<BatteryIcon size={12} />}
            label="Battery"
            value={batteryLevel != null ? `${Math.round(batteryLevel)}%` : '—'}
          />
        </div>

        {position?.address && (
          <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-slate-100 px-3 py-2.5">
            <MapPinned size={15} className="mt-0.5 shrink-0 text-sky-600" />
            <p className="line-clamp-2 text-xs leading-5 text-slate-600">{position.address}</p>
          </div>
        )}

        {position && (
          <button
            type="button"
            onClick={() => navigate(`/position/${position.id}`)}
            className="mt-2.5 flex w-full items-center justify-between rounded-xl bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            View position details
            <ArrowUpRight size={15} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-slate-100 bg-[linear-gradient(180deg,rgba(248,250,252,0.75),rgba(241,245,249,0.95))] p-3">
        <ActionButton
          label="Replay"
          tone="violet"
          onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
          disabled={!position}
        >
          <Route size={18} />
        </ActionButton>
        <ActionButton
          label="Command"
          tone="sky"
          onClick={() => navigate(`/settings/device/${deviceId}/command`)}
        >
          <Send size={18} />
        </ActionButton>
        <ActionButton
          label="Edit"
          tone="amber"
          onClick={() => navigate(`/settings/device/${deviceId}`)}
          disabled={deviceReadonly}
        >
          <Pencil size={18} />
        </ActionButton>
        <FloatingPanel
          open={moreOpen}
          onOpenChange={setMoreOpen}
          placement="top-end"
          className="w-56"
          trigger={(props, ref) => (
            <button
              {...props}
              ref={ref as any}
              type="button"
              className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-1.5 py-2.5 text-[0.68rem] font-semibold text-slate-600 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:shadow-md"
              aria-label="More device actions"
              title="More"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-600 shadow-inner transition duration-200 group-hover:bg-slate-800 group-hover:text-white">
                <Ellipsis size={19} />
              </span>
              <span className="w-full truncate text-center">More</span>
            </button>
          )}
        >
          <button
            type="button"
            disabled={!position || position.protocol !== 'jt808'}
            onClick={() => {
              setMoreOpen(false);
              navigate(`/stream?deviceId=${deviceId}`);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Video size={17} /> Live Video
          </button>
          {!readonly && (
            <button
              type="button"
              disabled={!position}
              onClick={createGeofence}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MapPinned size={17} /> Create Geofence
            </button>
          )}
          {position && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-100"
            >
              <ExternalLink size={17} /> Google Maps
            </a>
          )}
          {!shareDisabled && !user.temporary && (
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false);
                navigate(`/settings/device/${deviceId}/share`);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-sky-700 hover:bg-sky-50"
            >
              <Share2 size={17} /> Share
            </button>
          )}
        </FloatingPanel>
      </div>
    </section>
  );
}
