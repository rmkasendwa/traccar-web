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
import { speedFromKnots, speedUnitString } from '@/lib/converter';
import { useAttributePreference } from '@/lib/preferences';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
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
      button:
        'hover:border-violet-400/35 hover:bg-violet-400/10 hover:text-violet-700 dark:hover:text-violet-200',
      icon: 'from-violet-400 to-fuchsia-500 shadow-violet-500/25',
    },
    sky: {
      button:
        'hover:border-sky-400/35 hover:bg-sky-400/10 hover:text-sky-700 dark:hover:text-sky-200',
      icon: 'from-sky-400 to-cyan-500 shadow-sky-500/25',
    },
    amber: {
      button:
        'hover:border-amber-400/35 hover:bg-amber-400/10 hover:text-amber-700 dark:hover:text-amber-200',
      icon: 'from-amber-400 to-orange-500 shadow-amber-500/25',
    },
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex min-w-0 flex-col items-center gap-2 overflow-hidden rounded-2xl border border-(--color-divider) bg-(--color-surface-subtle) px-1.5 py-2.5 text-[0.68rem] font-semibold text-(--color-muted) transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 ${tones.button}`}
      aria-label={label}
      title={label}
    >
      <span
        className={`grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br text-white shadow-lg transition duration-200 group-hover:scale-105 ${tones.icon}`}
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
  <div className="min-w-0 rounded-xl border border-(--color-divider) bg-(--color-surface-subtle) p-2.5">
    <div className="flex items-center gap-1.5 text-[0.62rem] font-semibold uppercase tracking-widest text-(--color-muted)">
      {icon}
      {label}
    </div>
    <p
      className={`mt-1 truncate text-sm font-semibold ${accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-(--color-text)'}`}
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
  const t = useTranslation();
  const speedUnit = useAttributePreference('speedUnit', 'kn');
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
    <section className="absolute bottom-24 left-1/2 z-20 w-[min(calc(100%-1.5rem),25rem)] -translate-x-1/2 overflow-hidden rounded-[1.4rem] border border-(--color-divider) bg-(--color-paper) text-(--color-text) shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)] backdrop-blur-xl md:bottom-5 md:left-[calc(50%+11rem)]">
      <header className="relative overflow-hidden border-b border-(--color-divider) bg-(--color-paper) px-4 pb-4 pt-3.5 text-(--color-text)">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(14,165,233,0.32),transparent_48%)]" />
        <div className="relative flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-600 shadow-inner dark:text-sky-300">
            <Navigation size={20} fill="currentColor" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="truncate text-base font-semibold tracking-tight">{device.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.7rem] text-(--color-muted)">
              <span className="flex items-center gap-1.5 capitalize">
                <span className={`h-2 w-2 rounded-full shadow-md ${statusColor}`} />
                {device.status || 'Unknown'}
              </span>
              {batteryLevel != null && (
                <span className="flex items-center gap-1 rounded-full bg-(--color-surface-subtle) px-2 py-0.5 text-(--color-muted)">
                  <BatteryIcon size={13} />
                  {Math.round(batteryLevel)}%{charging ? ' · charging' : ''}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text)"
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
            value={
              position?.speed != null
                ? `${Math.round(speedFromKnots(position.speed, speedUnit))} ${speedUnitString(speedUnit, t)}`
                : '—'
            }
          />
          <Metric
            icon={<BatteryIcon size={12} />}
            label="Battery"
            value={batteryLevel != null ? `${Math.round(batteryLevel)}%` : '—'}
          />
        </div>

        {position?.address && (
          <div className="mt-2.5 flex items-start gap-2.5 rounded-xl border border-(--color-divider) px-3 py-2.5">
            <MapPinned size={15} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" />
            <p className="line-clamp-2 text-xs leading-5 text-(--color-muted)">
              {position.address}
            </p>
          </div>
        )}

        {position && (
          <button
            type="button"
            onClick={() => navigate(`/position/${position.id}`)}
            className="group mt-2.5 flex w-full items-center justify-between rounded-xl border border-(--color-divider) bg-(--color-surface-subtle) px-3 py-2 text-xs font-semibold text-(--color-primary) shadow-sm transition hover:border-(--color-primary) hover:bg-(--color-surface-hover) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            View position details
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-(--color-primary) text-white shadow-sm transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight size={14} />
            </span>
          </button>
        )}
      </div>

      <div className="relative overflow-hidden border-t border-(--color-divider) bg-(--color-paper) p-3">
        <div className="pointer-events-none absolute -bottom-14 left-1/4 h-24 w-24 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative mb-2 flex items-center justify-between px-1">
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
            Quick actions
          </span>
          <span className="flex items-center gap-1.5 text-[0.6rem] text-(--color-muted)">
            <span className="h-1 w-1 rounded-full bg-sky-400" />
            Device controls
          </span>
        </div>
        <div className="relative grid grid-cols-4 gap-2">
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
            className="w-56 border-(--color-divider) bg-(--color-paper) text-(--color-text)"
            trigger={(props, ref) => (
              <button
                {...props}
                ref={ref as any}
                type="button"
                className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-(--color-divider) bg-(--color-surface-subtle) px-1.5 py-2.5 text-[0.68rem] font-semibold text-(--color-muted) transition duration-200 hover:-translate-y-0.5 hover:border-slate-500/50 hover:bg-(--color-surface-hover) hover:text-(--color-text) hover:shadow-lg"
                aria-label="More device actions"
                title="More"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-slate-500 to-slate-700 text-white shadow-lg shadow-slate-950/30 transition duration-200 group-hover:scale-105">
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
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-(--color-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Video size={17} /> Live Video
            </button>
            {!readonly && (
              <button
                type="button"
                disabled={!position}
                onClick={createGeofence}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-(--color-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
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
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-(--color-surface-hover)"
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
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-950"
              >
                <Share2 size={17} /> Share
              </button>
            )}
          </FloatingPanel>
        </div>
      </div>
    </section>
  );
}
