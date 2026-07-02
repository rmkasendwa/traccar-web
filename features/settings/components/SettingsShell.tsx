'use client';

import SectionShell, { type SectionNavigationGroup } from '@/components/layout/SectionShell';
import { useAdministrator, useManager, useRestriction } from '@/lib/permissions';
import useFeatures from '@/lib/useFeatures';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { useSelector } from 'react-redux';
import {
  Bell,
  Calculator,
  CalendarDays,
  CircleHelp,
  CreditCard,
  Folder,
  MapPinned,
  Megaphone,
  Send,
  Server,
  Settings,
  SlidersHorizontal,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';
import type { ReactNode } from 'react';

export default function SettingsShell({ children }: { children: ReactNode }) {
  const t = useTranslation();
  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const features = useFeatures();
  const userId = useSelector((state: any) => state.session.user.id);
  const supportLink = useSelector((state: any) => state.session.server.attributes.support);
  const billingLink = useSelector((state: any) => state.session.user.attributes.billingLink);

  const groups: SectionNavigationGroup[] = [
    {
      title: 'Personal',
      items: [
        {
          label: t('sharedPreferences'),
          href: '/settings/preferences',
          icon: <SlidersHorizontal size={18} />,
          description: 'Customize maps, display units, and application behavior.',
        },
        ...(!readonly
          ? [
              {
                label: t('sharedNotifications'),
                href: '/settings/notifications',
                icon: <Bell size={18} />,
                description: 'Choose which events should notify you and how.',
              },
              {
                label: t('settingsUser'),
                href: `/settings/user/${userId}`,
                icon: <UserRound size={18} />,
                description: 'Manage your profile, password, and account details.',
              },
            ]
          : []),
      ],
    },
    ...(!readonly
      ? [
          {
            title: 'Fleet',
            items: [
              {
                label: t('deviceTitle'),
                href: '/settings/devices',
                icon: <Server size={18} />,
                description: 'Add, organize, and configure tracked devices.',
              },
              {
                label: t('sharedGeofences'),
                href: '/geofences',
                icon: <MapPinned size={18} />,
                description: 'Create and manage geographic boundaries.',
              },
              ...(!features.disableGroups
                ? [
                    {
                      label: t('settingsGroups'),
                      href: '/settings/groups',
                      icon: <Folder size={18} />,
                      description: 'Organize devices into reusable groups.',
                    },
                  ]
                : []),
              ...(!features.disableDrivers
                ? [
                    {
                      label: t('sharedDrivers'),
                      href: '/settings/drivers',
                      icon: <UserRound size={18} />,
                      description: 'Manage drivers and their identifiers.',
                    },
                  ]
                : []),
            ],
          },
          {
            title: 'Automation',
            collapsible: true,
            items: [
              ...(!features.disableCalendars
                ? [
                    {
                      label: t('sharedCalendars'),
                      href: '/settings/calendars',
                      icon: <CalendarDays size={18} />,
                      description: 'Define schedules used by rules and notifications.',
                    },
                  ]
                : []),
              ...(!features.disableComputedAttributes
                ? [
                    {
                      label: t('sharedComputedAttributes'),
                      href: '/settings/attributes',
                      icon: <Calculator size={18} />,
                      description: 'Derive useful values from incoming device data.',
                    },
                  ]
                : []),
              ...(!features.disableMaintenance
                ? [
                    {
                      label: t('sharedMaintenance'),
                      href: '/settings/maintenances',
                      icon: <Wrench size={18} />,
                      description: 'Track service intervals and maintenance tasks.',
                    },
                  ]
                : []),
              ...(!features.disableSavedCommands
                ? [
                    {
                      label: t('sharedSavedCommands'),
                      href: '/settings/commands',
                      icon: <Send size={18} />,
                      description: 'Prepare commands for quick, repeatable use.',
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
    ...(manager
      ? [
          {
            title: 'Administration',
            collapsible: true,
            items: [
              {
                label: t('serverAnnouncement'),
                href: '/settings/announcement',
                icon: <Megaphone size={18} />,
                description: 'Publish a message to platform users.',
              },
              ...(admin
                ? [
                    {
                      label: t('settingsServer'),
                      href: '/settings/server',
                      icon: <Settings size={18} />,
                      description: 'Configure global server defaults and capabilities.',
                    },
                  ]
                : []),
              {
                label: t('settingsUsers'),
                href: '/settings/users',
                icon: <Users size={18} />,
                description: 'Create and administer platform users.',
              },
            ],
          },
        ]
      : []),
    ...(billingLink || supportLink
      ? [
          {
            title: 'Resources',
            collapsible: true,
            items: [
              ...(billingLink
                ? [{ label: t('userBilling'), href: billingLink, icon: <CreditCard size={18} /> }]
                : []),
              ...(supportLink
                ? [
                    {
                      label: t('settingsSupport'),
                      href: supportLink,
                      icon: <CircleHelp size={18} />,
                    },
                  ]
                : []),
            ],
          },
        ]
      : []),
  ];

  return (
    <SectionShell
      title="Settings"
      description="Configure your account, fleet, and platform."
      groups={groups}
      backHref="/"
      backLabel="Back to map"
    >
      <div className="h-full min-h-0 overflow-auto bg-(--color-background) p-3 sm:p-4 lg:p-6">
        {children}
      </div>
    </SectionShell>
  );
}
