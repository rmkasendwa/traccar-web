'use client';

import { useSelector } from 'react-redux';
import { BarChart3, Map, Settings } from 'lucide-react';
import { Link } from '@/lib/router';
import AccountAvatarMenu from '@/components/layout/AccountAvatarMenu';

export default function HomeNavigation({ mobile = false }: { mobile?: boolean }) {
  const devices = useSelector((state: any) => state.devices.items);
  const selectedId = useSelector((state: any) => state.devices.selectedId);

  const ids = Object.keys(devices);
  const reportDeviceId = selectedId || (ids.length === 1 ? ids[0] : null);
  const reportsHref = reportDeviceId
    ? `/reports/combined?deviceId=${reportDeviceId}`
    : '/reports/combined';

  const itemClass = mobile
    ? 'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[0.65rem] font-medium text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text)'
    : 'flex flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2.5 text-[0.68rem] font-medium text-(--color-muted) transition hover:bg-(--color-surface-hover) hover:text-(--color-text)';
  const labelClass = mobile ? 'text-[0.65rem] font-medium' : 'text-[0.68rem] font-medium';

  return (
    <nav
      className={
        mobile
          ? 'flex items-center rounded-2xl border border-(--color-divider) bg-(--color-paper) p-1.5 shadow-xl backdrop-blur'
          : 'flex items-center border-t border-(--color-divider) bg-white/80 p-2 dark:bg-transparent'
      }
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className={`${itemClass} bg-(--color-surface-hover) text-sky-600 dark:text-sky-400`}
      >
        <Map size={19} />
        Map
      </Link>
      <Link href={reportsHref} className={itemClass}>
        <BarChart3 size={19} />
        Reports
      </Link>
      <Link href="/settings/preferences?menu=true" className={itemClass}>
        <Settings size={19} />
        Settings
      </Link>
      <AccountAvatarMenu
        placement="top-start"
        className={itemClass}
        label="Account"
        labelClassName={labelClass}
        showLabel
        avatarSize="nav"
      />
    </nav>
  );
}
