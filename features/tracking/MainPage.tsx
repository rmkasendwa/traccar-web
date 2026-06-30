'use client';

import usePersistedState from '@/lib/usePersistedState';
import { devicesActions, sessionActions } from '@/store';
import { Menu, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EventsDrawer from './EventsDrawer';
import DeviceSidebar from './components/DeviceSidebar';
import HomeNavigation from './components/HomeNavigation';
import SelectedDeviceCard from './components/SelectedDeviceCard';

const MainMap = dynamic(() => import('@/features/tracking/MainMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full animate-pulse bg-[linear-gradient(135deg,#dbe5df_0%,#eef3ef_45%,#d7e1dc_100%)]" />
  ),
});

type MainPageProps = {
  initialDevices: any[];
  initialPositions: any[];
};

const MainPage = ({ initialDevices, initialPositions }: MainPageProps) => {
  const dispatch = useDispatch();
  const deviceItems = useSelector((state: any) => state.devices.items);
  const positionItems = useSelector((state: any) => state.session.positions);
  const storedDevices = useMemo(() => Object.values(deviceItems) as any[], [deviceItems]);
  const storedPositions = useMemo(() => Object.values(positionItems) as any[], [positionItems]);
  const devices = storedDevices.length ? storedDevices : initialDevices;
  const positions = storedPositions.length ? storedPositions : initialPositions;
  const selectedDeviceId = useSelector((state: any) => state.devices.selectedId);
  const user = useSelector((state: any) => state.session.user);

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = usePersistedState('homeStatusFilter', []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const hydratingSelection = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    dispatch(devicesActions.refresh(initialDevices));
    if (user && initialPositions.length) {
      dispatch(sessionActions.updatePositions(initialPositions));
    }
  }, [dispatch, initialDevices, initialPositions, user]);

  useEffect(() => {
    if (selectedDeviceId) {
      setSidebarOpen(false);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    const restoreSelection = () => {
      const value = new URLSearchParams(window.location.search).get('deviceId');
      const parsed = value ? Number(value) : null;
      const deviceId = parsed != null && Number.isFinite(parsed) ? parsed : null;
      hydratingSelection.current = deviceId;
      dispatch(devicesActions.selectId(deviceId));
    };

    restoreSelection();
    window.addEventListener('popstate', restoreSelection);
    return () => window.removeEventListener('popstate', restoreSelection);
  }, [dispatch]);

  useEffect(() => {
    if (hydratingSelection.current !== undefined) {
      if (selectedDeviceId === hydratingSelection.current) {
        hydratingSelection.current = undefined;
      }
      return;
    }

    const url = new URL(window.location.href);
    if (selectedDeviceId) {
      url.searchParams.set('deviceId', String(selectedDeviceId));
    } else {
      url.searchParams.delete('deviceId');
    }
    window.history.replaceState(window.history.state, '', url);
  }, [selectedDeviceId]);

  const filteredDevices = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase();
    return devices
      .filter((device) => !query || device.name?.toLocaleLowerCase().includes(query))
      .filter((device) => !statusFilter.length || statusFilter.includes(device.status))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [devices, keyword, statusFilter]);

  const filteredPositions = useMemo(() => {
    const ids = new Set(filteredDevices.map((device) => device.id));
    return positions.filter((position) => ids.has(position.deviceId));
  }, [filteredDevices, positions]);

  const selectedPosition = positions.find((position) => position.deviceId === selectedDeviceId);

  return (
    <main className="relative h-full min-h-0 overflow-hidden bg-slate-100">
      <div className="absolute inset-0">
        <MainMap
          filteredPositions={filteredPositions}
          selectedPosition={selectedPosition}
          onEventsClick={() => setEventsOpen(true)}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 hidden p-3 md:block">
        <aside className="pointer-events-auto flex h-full w-88 flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/25 backdrop-blur">
          <DeviceSidebar
            devices={filteredDevices}
            allDevices={devices}
            keyword={keyword}
            onKeywordChange={setKeyword}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
          <HomeNavigation />
        </aside>
      </div>

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="absolute left-3 top-3 z-20 grid h-11 w-11 place-items-center rounded-xl border border-white/70 bg-white/95 text-slate-800 shadow-lg backdrop-blur md:hidden"
        aria-label="Open devices"
      >
        <Menu size={21} />
      </button>

      <div
        className={`absolute inset-0 z-30 bg-slate-950/35 transition-opacity md:hidden ${
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`absolute inset-y-0 left-0 z-40 flex w-[min(90vw,23rem)] flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close devices"
        >
          <X size={20} />
        </button>
        <DeviceSidebar
          devices={filteredDevices}
          allDevices={devices}
          keyword={keyword}
          onKeywordChange={setKeyword}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          mobile
        />
      </aside>

      {selectedDeviceId && (
        <SelectedDeviceCard
          deviceId={selectedDeviceId}
          position={selectedPosition}
          onClose={() => dispatch(devicesActions.selectId(null))}
        />
      )}

      <div className="absolute inset-x-3 bottom-3 z-20 md:hidden">
        <HomeNavigation mobile />
      </div>

      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
    </main>
  );
};

export default MainPage;
