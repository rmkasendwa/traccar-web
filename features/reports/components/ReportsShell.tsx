'use client';

import {
  Activity,
  BarChart3,
  CalendarClock,
  ChartNoAxesCombined,
  CirclePause,
  FileSearch,
  Flag,
  ListChecks,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import SectionShell, { type SectionNavigationGroup } from '@/components/layout/SectionShell';
import { useAdministrator, useRestriction } from '@/lib/permissions';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

export default function ReportsShell({ children }: { children: ReactNode }) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const buildLink = (path: string) => {
    const params = new URLSearchParams();
    const deviceIds = searchParams.getAll('deviceId');
    const groupIds = searchParams.getAll('groupId');
    if (path === '/reports/chart' || path === '/reports/route' || path === '/replay') {
      if (deviceIds[0]) params.set('deviceId', deviceIds[0]);
    } else {
      deviceIds.forEach((id) => params.append('deviceId', id));
      groupIds.forEach((id) => params.append('groupId', id));
    }
    return params.size ? `${path}?${params}` : path;
  };

  const groups: SectionNavigationGroup[] = [
    {
      title: 'Overview',
      items: [
        {
          label: t('reportCombined'),
          href: buildLink('/reports/combined'),
          icon: <Sparkles size={18} />,
          description: 'A unified timeline of device activity.',
        },
        {
          label: t('reportSummary'),
          href: buildLink('/reports/summary'),
          icon: <ListChecks size={18} />,
          description: 'High-level distance, speed, fuel, and usage totals.',
        },
        {
          label: t('reportChart'),
          href: buildLink('/reports/chart'),
          icon: <TrendingUp size={18} />,
          description: 'Visualize route metrics and device attributes over time.',
        },
      ],
    },
    {
      title: 'Movement',
      items: [
        {
          label: t('reportTrips'),
          href: buildLink('/reports/trips'),
          icon: <Route size={18} />,
          description: 'Review completed journeys and movement details.',
        },
        {
          label: t('reportStops'),
          href: buildLink('/reports/stops'),
          icon: <CirclePause size={18} />,
          description: 'Inspect stop locations and dwell durations.',
        },
        {
          label: t('reportPositions'),
          href: buildLink('/reports/route'),
          icon: <MapPin size={18} />,
          description: 'Explore every recorded position in a period.',
        },
      ],
    },
    {
      title: 'Activity',
      collapsible: true,
      items: [
        {
          label: t('reportEvents'),
          href: buildLink('/reports/events'),
          icon: <Activity size={18} />,
          description: 'Filter alarms, notifications, and device events.',
        },
        {
          label: t('sharedGeofences'),
          href: buildLink('/reports/geofences'),
          icon: <Flag size={18} />,
          description: 'Review time spent entering and leaving geofences.',
        },
        {
          label: t('reportReplay'),
          href: buildLink('/replay'),
          icon: <ChartNoAxesCombined size={18} />,
          description: 'Play back a recorded route on the map.',
        },
      ],
    },
    {
      title: 'Operations',
      collapsible: true,
      items: [
        {
          label: t('sharedLogs'),
          href: '/reports/logs',
          icon: <FileSearch size={18} />,
          description: 'Inspect raw device communication logs.',
        },
        ...(!readonly
          ? [
              {
                label: t('reportScheduled'),
                href: '/reports/scheduled',
                icon: <CalendarClock size={18} />,
                description: 'Manage recurring report delivery.',
              },
            ]
          : []),
        ...(admin
          ? [
              {
                label: t('statisticsTitle'),
                href: '/reports/statistics',
                icon: <BarChart3 size={18} />,
                description: 'Review platform-wide operational statistics.',
              },
              {
                label: t('reportAudit'),
                href: '/reports/audit',
                icon: <ShieldCheck size={18} />,
                description: 'Inspect administrative and user activity.',
              },
            ]
          : []),
      ],
    },
  ];
  return (
    <SectionShell
      eyebrow="Reports workspace"
      title="Reports"
      description="Turn location history into clear operational insights."
      groups={groups}
      backHref="/"
      backLabel="Back to map"
    >
      <div className="reports-workspace h-full min-h-0 overflow-auto p-3 sm:p-4 lg:p-6">
        {children}
      </div>
    </SectionShell>
  );
}
