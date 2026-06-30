import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlertTriangle,
  CalendarRange,
  CircleGauge,
  Clock3,
  Download,
  LocateFixed,
  MapPinOff,
  Navigation,
  Route,
  Search,
  ShieldAlert,
  Smartphone,
  WifiOff,
} from 'lucide-react';
import ReplayFilterPanel from '@/features/replay/components/ReplayFilterPanel';
import ReplayPanel from '@/features/replay/components/ReplayPanel';
import ReplayPlayer, {
  ReplayControls,
  ReplayMapView,
} from '@/features/replay/components/ReplayPlayer';
import { calculateReplayStatistics, formatDuration } from '@/features/replay/lib/replay';
import type { ReplayDevice, ReplayPosition } from '@/features/replay/types';
import { fetchFromRequestOrigin } from '@/lib/serverFetch';

export const metadata: Metadata = {
  title: 'Route replay · Traccar',
  description: 'Review a device route and replay its recorded positions.',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type LoadError = 'permission' | 'offline' | 'request';
type PageState = 'setup' | 'invalid' | 'empty' | 'noDevices' | LoadError;

const valueOf = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const parseDate = (value: string) =>
  Date.parse(/[zZ]$|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );

async function loadDevices() {
  try {
    const response = await fetchFromRequestOrigin('/api/devices');
    if (!response) return { devices: [] as ReplayDevice[], error: 'offline' as LoadError };
    if (response.status === 401 || response.status === 403) {
      return { devices: [] as ReplayDevice[], error: 'permission' as LoadError };
    }
    if (!response.ok) return { devices: [] as ReplayDevice[], error: 'request' as LoadError };
    return { devices: (await response.json()) as ReplayDevice[], error: null };
  } catch {
    return { devices: [] as ReplayDevice[], error: 'offline' as LoadError };
  }
}

async function loadPositions(deviceId: string, from: string, to: string) {
  try {
    const query = new URLSearchParams({ deviceId, from, to });
    const response = await fetchFromRequestOrigin(`/api/positions?${query}`);
    if (!response) return { positions: [] as ReplayPosition[], error: 'offline' as LoadError };
    if (response.status === 401 || response.status === 403) {
      return { positions: [] as ReplayPosition[], error: 'permission' as LoadError };
    }
    if (!response.ok) return { positions: [] as ReplayPosition[], error: 'request' as LoadError };
    return { positions: (await response.json()) as ReplayPosition[], error: null };
  } catch {
    return { positions: [] as ReplayPosition[], error: 'offline' as LoadError };
  }
}

const stateContent = {
  setup: {
    icon: Search,
    title: 'Ready when you are',
    description: 'Choose a device and a quick period above to paint its route onto the map.',
  },
  invalid: {
    icon: CalendarRange,
    title: 'Check the date range',
    description: 'The end time must be later than the start time.',
  },
  empty: {
    icon: MapPinOff,
    title: 'No recorded positions',
    description: 'Try a wider period—this device has no history in the selected range.',
  },
  noDevices: {
    icon: Smartphone,
    title: 'No devices available',
    description: 'Add a device or ask an administrator for access.',
  },
  permission: {
    icon: ShieldAlert,
    title: 'Replay access is restricted',
    description: 'Choose another device or contact an administrator.',
  },
  offline: {
    icon: WifiOff,
    title: 'The server is unreachable',
    description: 'Check your connection and try again.',
  },
  request: {
    icon: AlertTriangle,
    title: 'Replay could not be loaded',
    description: 'Adjust the period or try the request again.',
  },
};

function StateCard({ type }: { type: PageState }) {
  const content = stateContent[type];
  const Icon = content.icon;
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 p-5 text-center">
      <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-500 shadow-sm">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h2 className="mt-3 text-sm font-semibold text-slate-900">{content.title}</h2>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">{content.description}</p>
      {(type === 'offline' || type === 'request') && (
        <Link
          href="/replay"
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
        >
          Start again
        </Link>
      )}
    </div>
  );
}

export default async function ReplayPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawDeviceId = valueOf(params.deviceId);
  const rawFrom = valueOf(params.from);
  const rawTo = valueOf(params.to);
  const rawPeriod = valueOf(params.period);
  const deviceId = rawDeviceId && /^\d+$/.test(rawDeviceId) ? rawDeviceId : '';
  const fromTime = rawFrom ? parseDate(rawFrom) : Number.NaN;
  const toTime = rawTo ? parseDate(rawTo) : Number.NaN;
  const hasRange = Boolean(rawFrom && rawTo);
  const validRange =
    hasRange && Number.isFinite(fromTime) && Number.isFinite(toTime) && fromTime < toTime;
  const normalizedFrom = validRange ? new Date(fromTime).toISOString() : '';
  const normalizedTo = validRange ? new Date(toTime).toISOString() : '';
  const renderTime = new Date();
  const initialCustomFrom = validRange
    ? normalizedFrom.slice(0, 16)
    : new Date(renderTime.getTime() - 60 * 60 * 1000).toISOString().slice(0, 16);
  const initialCustomTo = validRange
    ? normalizedTo.slice(0, 16)
    : renderTime.toISOString().slice(0, 16);

  const devicesResult = await loadDevices();
  const selectedDevice = devicesResult.devices.find((device) => String(device.id) === deviceId);
  const positionsResult =
    deviceId && validRange && selectedDevice && !devicesResult.error
      ? await loadPositions(deviceId, normalizedFrom, normalizedTo)
      : { positions: [] as ReplayPosition[], error: null };
  const statistics = calculateReplayStatistics(positionsResult.positions);
  const hasReplay = positionsResult.positions.length > 0 && Boolean(selectedDevice);

  const state: PageState =
    devicesResult.error || positionsResult.error
      ? (devicesResult.error || positionsResult.error)!
      : hasRange && !validRange
        ? 'invalid'
        : !devicesResult.devices.length
          ? 'noDevices'
          : deviceId && validRange && !selectedDevice
            ? 'permission'
            : deviceId && validRange && !positionsResult.positions.length
              ? 'empty'
              : 'setup';

  return (
    <main className="relative h-full min-h-0 overflow-hidden bg-slate-200">
      <ReplayPlayer positions={positionsResult.positions}>
        <div className="absolute inset-0">
          <ReplayMapView />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-md bg-linear-to-r from-slate-950/20 to-transparent md:block" />

        <ReplayPanel
          hasReplay={hasReplay}
          footer={
            hasReplay && selectedDevice ? (
              <section aria-label="Replay controls" className="mx-auto max-w-lg">
                <ReplayControls />
              </section>
            ) : undefined
          }
        >
          <ReplayFilterPanel
            devices={devicesResult.devices}
            deviceId={deviceId}
            initialFrom={validRange ? normalizedFrom : rawFrom}
            initialTo={validRange ? normalizedTo : rawTo}
            initialPeriod={rawPeriod}
            initialCustomFrom={initialCustomFrom}
            initialCustomTo={initialCustomTo}
          />

          {hasReplay && selectedDevice ? (
            <>
              <section aria-label="Replay summary" className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: 'Distance',
                    value: `${statistics.distanceKm.toFixed(1)} km`,
                    icon: Route,
                  },
                  {
                    label: 'Duration',
                    value: formatDuration(statistics.durationMs),
                    icon: Clock3,
                  },
                  {
                    label: 'Max speed',
                    value: `${statistics.maxSpeedKph.toFixed(0)} km/h`,
                    icon: CircleGauge,
                  },
                  {
                    label: 'GPS points',
                    value: statistics.positionCount.toLocaleString(),
                    icon: LocateFixed,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <article
                    key={label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center gap-1.5 text-[0.66rem] font-semibold text-slate-500">
                      <Icon size={13} className="text-sky-600" aria-hidden="true" /> {label}
                    </div>
                    <p className="mt-1 text-base font-bold tracking-tight text-slate-950">
                      {value}
                    </p>
                  </article>
                ))}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm shadow-slate-950/5 backdrop-blur">
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-950/5 px-4 py-3 shadow-inner">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-700">
                    <Smartphone size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950">
                      {selectedDevice.name}
                    </p>
                    <p className="text-[0.68rem] capitalize text-slate-500">
                      {selectedDevice.status || 'Status unavailable'}
                      {selectedDevice.model ? ` · ${selectedDevice.model}` : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 border-t border-slate-200/75 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Navigation size={14} className="text-sky-600" aria-hidden="true" />
                    <span>
                      {formatDate(normalizedFrom)} → {formatDate(normalizedTo)}
                    </span>
                  </div>
                  <a
                    href={`/api/positions/kml?${new URLSearchParams({ deviceId, from: normalizedFrom, to: normalizedTo })}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                  >
                    <Download size={14} aria-hidden="true" /> Download route as KML
                  </a>
                </div>
              </section>
            </>
          ) : (
            <StateCard type={state} />
          )}
        </ReplayPanel>
      </ReplayPlayer>
    </main>
  );
}
