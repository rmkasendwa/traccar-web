'use client';

import { useState, type ReactNode } from 'react';
import { useSelector } from 'react-redux';
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  Ellipsis,
  ExternalLink,
  MapPinned,
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
  children,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-[0.68rem] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-35"
    aria-label={label}
    title={label}
  >
    {children}
    <span className="truncate">{label}</span>
  </button>
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
  const statusColor =
    device.status === 'online'
      ? 'bg-emerald-500'
      : device.status === 'offline'
        ? 'bg-slate-400'
        : 'bg-amber-400';

  const rows = [
    ['Last update', device.lastUpdate ? dayjs(device.lastUpdate).fromNow() : 'No update'],
    position?.speed != null ? ['Speed', `${Math.round(position.speed)} kn`] : null,
    batteryLevel != null
      ? ['Battery', `${Math.round(batteryLevel)}%${charging ? ' · charging' : ''}`]
      : null,
    position?.address ? ['Address', position.address] : null,
  ].filter(Boolean) as string[][];

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
    <section className="absolute bottom-24 left-1/2 z-20 w-[min(calc(100%-1.5rem),27rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/70 bg-white/95 text-slate-900 shadow-2xl backdrop-blur md:bottom-5 md:left-[calc(50%+11rem)]">
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${statusColor}`} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold">{device.name}</h2>
            <div className="mt-1 flex items-center gap-2 text-xs capitalize text-slate-500">
              <span>{device.status || 'Unknown'}</span>
              {batteryLevel != null && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1 normal-case">
                    <BatteryIcon size={14} />
                    {Math.round(batteryLevel)}%
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close device details"
          >
            <X size={18} />
          </button>
        </div>

        <dl className="mt-4 grid gap-2.5 border-t border-slate-100 pt-3">
          {rows.slice(0, 4).map(([label, value]) => (
            <div key={label} className="grid grid-cols-[5.5rem_1fr] gap-3 text-xs">
              <dt className="text-slate-400">{label}</dt>
              <dd
                className={`text-right font-medium text-slate-700 ${label === 'Address' ? 'line-clamp-2' : 'truncate'}`}
              >
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {position && (
          <button
            type="button"
            onClick={() => navigate(`/position/${position.id}`)}
            className="mt-3 text-xs font-semibold text-sky-700 transition hover:text-sky-900 hover:underline"
          >
            More Details
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 border-t border-slate-100 bg-slate-50/70 p-1.5">
        <ActionButton
          label="Replay"
          onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
          disabled={!position}
        >
          <Route size={18} />
        </ActionButton>
        <ActionButton
          label="Command"
          onClick={() => navigate(`/settings/device/${deviceId}/command`)}
        >
          <Send size={18} />
        </ActionButton>
        <ActionButton
          label="Edit"
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
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-[0.68rem] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-sky-700"
              aria-label="More device actions"
              title="More"
            >
              <Ellipsis size={19} />
              <span>More</span>
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
            <Video size={17} />
            Live Video
          </button>
          {!readonly && (
            <button
              type="button"
              disabled={!position}
              onClick={createGeofence}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MapPinned size={17} />
              Create Geofence
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
              <ExternalLink size={17} />
              Google Maps
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
              <Share2 size={17} />
              Share
            </button>
          )}
        </FloatingPanel>
      </div>
    </section>
  );
}
