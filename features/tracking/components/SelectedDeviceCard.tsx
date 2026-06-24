'use client';

import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Battery, BatteryCharging, ExternalLink, Pencil, Route, Send, X } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from '@/lib/router';

dayjs.extend(relativeTime);

type SelectedDeviceCardProps = {
  deviceId: number;
  position?: any;
  onClose: () => void;
};

const ActionButton = ({
  label,
  onClick,
  href,
  disabled,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  children: ReactNode;
}) => {
  const className =
    'flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-[0.68rem] font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-35';

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        aria-label={label}
        title={label}
      >
        {children}
        <span className="truncate">{label}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label={label}
      title={label}
    >
      {children}
      <span className="truncate">{label}</span>
    </button>
  );
};

export default function SelectedDeviceCard({
  deviceId,
  position,
  onClose,
}: SelectedDeviceCardProps) {
  const navigate = useNavigate();
  const device = useSelector((state: any) => state.devices.items[deviceId]);
  if (!device) return null;

  const batteryLevel = position?.attributes?.batteryLevel;
  const charging = position?.attributes?.charge;
  const BatteryIcon = charging ? BatteryCharging : Battery;
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
      </div>

      <div className="grid grid-cols-4 border-t border-slate-100 bg-slate-50/70 p-1.5">
        <ActionButton
          label="Google Maps"
          href={
            position
              ? `https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`
              : undefined
          }
          disabled={!position}
        >
          <ExternalLink size={18} />
        </ActionButton>
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
        <ActionButton label="Edit" onClick={() => navigate(`/settings/device/${deviceId}`)}>
          <Pencil size={18} />
        </ActionButton>
      </div>
    </section>
  );
}
