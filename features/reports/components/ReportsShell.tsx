'use client';

import SectionShell, { type SectionNavigationGroup } from '@/components/layout/SectionShell';
import { useAdministrator, useRestriction } from '@/lib/permissions';
import { routes } from '@/lib/routes';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
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

export default function ReportsShell({ children }: { children: ReactNode }) {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const admin = useAdministrator();
  const readonly = useRestriction('readonly');

  const buildLink = (path: string) => {
    const params = new URLSearchParams();
    const deviceIds = searchParams.getAll('deviceId');
    const groupIds = searchParams.getAll('groupId');
    if (
      path === routes.reports.chart ||
      path === routes.reports.route ||
      path === routes.replay.index
    ) {
      if (deviceIds[0]) params.set('deviceId', deviceIds[0]);
    } else {
      deviceIds.forEach((id) => params.append('deviceId', id));
      groupIds.forEach((id) => params.append('groupId', id));
    }
    return params.size ? `${path}?${params}` : path;
  };

  const groups: SectionNavigationGroup[] = [
    {
      title: t('reportsOverview'),
      items: [
        {
          label: t('reportCombined'),
          href: buildLink(routes.reports.combined),
          icon: <Sparkles size={18} />,
          description: t('reportsCombinedDescription'),
        },
        {
          label: t('reportSummary'),
          href: buildLink(routes.reports.summary),
          icon: <ListChecks size={18} />,
          description: t('reportsSummaryDescription'),
        },
        {
          label: t('reportChart'),
          href: buildLink(routes.reports.chart),
          icon: <TrendingUp size={18} />,
          description: t('reportsChartDescription'),
        },
      ],
    },
    {
      title: t('reportsMovement'),
      items: [
        {
          label: t('reportTrips'),
          href: buildLink(routes.reports.trips),
          icon: <Route size={18} />,
          description: t('reportsTripsDescription'),
        },
        {
          label: t('reportStops'),
          href: buildLink(routes.reports.stops),
          icon: <CirclePause size={18} />,
          description: t('reportsStopsDescription'),
        },
        {
          label: t('reportPositions'),
          href: buildLink(routes.reports.route),
          icon: <MapPin size={18} />,
          description: t('reportsPositionsDescription'),
        },
      ],
    },
    {
      title: t('reportsActivity'),
      collapsible: true,
      items: [
        {
          label: t('reportEvents'),
          href: buildLink(routes.reports.events),
          icon: <Activity size={18} />,
          description: t('reportsEventsDescription'),
        },
        {
          label: t('sharedGeofences'),
          href: buildLink(routes.reports.geofences),
          icon: <Flag size={18} />,
          description: t('reportsGeofencesDescription'),
        },
        {
          label: t('reportReplay'),
          href: buildLink(routes.replay.index),
          icon: <ChartNoAxesCombined size={18} />,
          description: t('reportsReplayDescription'),
        },
      ],
    },
    {
      title: t('reportsOperations'),
      collapsible: true,
      items: [
        {
          label: t('sharedLogs'),
          href: routes.reports.logs,
          icon: <FileSearch size={18} />,
          description: t('reportsLogsDescription'),
        },
        ...(!readonly
          ? [
              {
                label: t('reportScheduled'),
                href: routes.reports.scheduled,
                icon: <CalendarClock size={18} />,
                description: t('reportsScheduledDescription'),
              },
            ]
          : []),
        ...(admin
          ? [
              {
                label: t('statisticsTitle'),
                href: routes.reports.statistics,
                icon: <BarChart3 size={18} />,
                description: t('reportsStatisticsDescription'),
              },
              {
                label: t('reportAudit'),
                href: routes.reports.audit,
                icon: <ShieldCheck size={18} />,
                description: t('reportsAuditDescription'),
              },
            ]
          : []),
      ],
    },
  ];
  return (
    <SectionShell
      title={t('reportsTitle')}
      description={t('reportsDescription')}
      groups={groups}
      backHref={routes.home}
      backLabel={t('sharedBackToMap')}
    >
      <div className="reports-workspace h-full min-h-0 overflow-auto bg-(--color-background) p-3 sm:p-4 lg:p-6">
        {children}
      </div>
    </SectionShell>
  );
}
