'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Ellipsis, ExternalLink, Pencil, Route, Send, X } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from '@/lib/router';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';

dayjs.extend(relativeTime);

type SelectedDeviceCardProps = {
  deviceId: number;
  position?: any;
  onClose: () => void;
};

export default function SelectedDeviceCard({
  deviceId,
  position,
  onClose,
}: SelectedDeviceCardProps) {
  const navigate = useNavigate();
  const device = useSelector((state: any) => state.devices.items[deviceId]);
  const [menuOpen, setMenuOpen] = useState(false);
  if (!device) return null;

  const rows = [
    ['Status', device.status || 'Unknown'],
    ['Last update', device.lastUpdate ? dayjs(device.lastUpdate).fromNow() : 'No update'],
    position?.speed != null ? ['Speed', `${Math.round(position.speed)} kn`] : null,
    position?.address ? ['Address', position.address] : null,
  ].filter(Boolean) as string[][];

  return (
    <section className="absolute bottom-24 left-1/2 z-20 w-[min(calc(100%-1.5rem),25rem)] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur md:bottom-5 md:left-[calc(50%+11rem)]">
      <div className="flex items-start gap-3">
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${device.status === 'online' ? 'bg-emerald-500' : device.status === 'offline' ? 'bg-slate-400' : 'bg-amber-400'}`}
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold">{device.name}</h2>
          <p className="mt-0.5 text-xs capitalize text-slate-500">{device.status || 'Unknown'}</p>
        </div>
        <FloatingPanel
          open={menuOpen}
          onOpenChange={setMenuOpen}
          className="w-52"
          trigger={(props, ref) => (
            <button
              {...props}
              ref={ref as any}
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Device actions"
            >
              <Ellipsis size={20} />
            </button>
          )}
        >
          {position && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-100"
            >
              <ExternalLink size={17} /> Open in Google Maps
            </a>
          )}
          <button
            type="button"
            onClick={() => navigate(`/replay?deviceId=${deviceId}`)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-100"
          >
            <Route size={17} /> Replay route
          </button>
          <button
            type="button"
            onClick={() => navigate(`/settings/device/${deviceId}/command`)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-100"
          >
            <Send size={17} /> Send command
          </button>
          <button
            type="button"
            onClick={() => navigate(`/settings/device/${deviceId}`)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-100"
          >
            <Pencil size={17} /> Edit device
          </button>
        </FloatingPanel>
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Close device details"
        >
          <X size={18} />
        </button>
      </div>
      <dl className="mt-4 grid gap-2 border-t border-slate-100 pt-3">
        {rows.slice(1, 4).map(([label, value]) => (
          <div key={label} className="grid grid-cols-[5.5rem_1fr] gap-3 text-xs">
            <dt className="text-slate-400">{label}</dt>
            <dd className="truncate text-right font-medium text-slate-700">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
