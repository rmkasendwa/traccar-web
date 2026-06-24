'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, LogOut, Map, Settings, UserRound } from 'lucide-react';
import { useNavigate } from '@/lib/router';
import { sessionActions } from '@/store';
import FloatingPanel from '@/features/tracking/components/FloatingPanel';
import { nativePostMessage } from '@/controllers/NativeInterface';

export default function HomeNavigation({ mobile = false }: { mobile?: boolean }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.session.user);
  const devices = useSelector((state: any) => state.devices.items);
  const selectedId = useSelector((state: any) => state.devices.selectedId);
  const [accountOpen, setAccountOpen] = useState(false);

  const reports = () => {
    const ids = Object.keys(devices);
    const deviceId = selectedId || (ids.length === 1 ? ids[0] : null);
    navigate(deviceId ? `/reports/combined?deviceId=${deviceId}` : '/reports/combined');
  };
  const logout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    dispatch(sessionActions.updateUser(null));
    navigate('/login');
  };

  const itemClass = mobile
    ? 'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.65rem] font-medium text-slate-500 transition hover:bg-slate-100'
    : 'flex flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-[0.68rem] font-medium text-slate-400 transition hover:bg-white/[0.07] hover:text-white';

  return (
    <nav
      className={
        mobile
          ? 'flex items-center rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-xl backdrop-blur'
          : 'flex items-center border-t border-white/10 p-2'
      }
      aria-label="Main navigation"
    >
      <button
        type="button"
        className={`${itemClass} ${mobile ? 'bg-sky-50 text-sky-700' : 'bg-white/[0.07] text-white'}`}
      >
        <Map size={19} />
        Map
      </button>
      <button type="button" onClick={reports} className={itemClass}>
        <BarChart3 size={19} />
        Reports
      </button>
      <button
        type="button"
        onClick={() => navigate('/settings/preferences?menu=true')}
        className={itemClass}
      >
        <Settings size={19} />
        Settings
      </button>
      <FloatingPanel
        open={accountOpen}
        onOpenChange={setAccountOpen}
        placement={mobile ? 'top-end' : 'top-end'}
        className="w-52"
        trigger={(props, ref) => (
          <button {...props} ref={ref as any} type="button" className={itemClass}>
            <UserRound size={19} />
            Account
          </button>
        )}
      >
        <button
          type="button"
          onClick={() => navigate(`/settings/user/${user.id}`)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-100"
        >
          <UserRound size={17} />
          Profile
        </button>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
        >
          <LogOut size={17} />
          Log out
        </button>
      </FloatingPanel>
    </nav>
  );
}
