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
      title: t('settingsPersonal'),
      items: [
        {
          label: t('sharedPreferences'),
          href: '/settings/preferences',
          icon: <SlidersHorizontal size={18} />,
          description: t('settingsPreferencesDescription'),
        },
        ...(!readonly
          ? [
              {
                label: t('sharedNotifications'),
                href: '/settings/notifications',
                icon: <Bell size={18} />,
                description: t('settingsNotificationsDescription'),
              },
              {
                label: t('settingsUser'),
                href: `/settings/user/${userId}`,
                icon: <UserRound size={18} />,
                description: t('settingsUserDescription'),
              },
            ]
          : []),
      ],
    },
    ...(!readonly
      ? [
          {
            title: t('settingsFleet'),
            items: [
              {
                label: t('deviceTitle'),
                href: '/settings/devices',
                icon: <Server size={18} />,
                description: t('settingsDevicesDescription'),
              },
              {
                label: t('sharedGeofences'),
                href: '/geofences',
                icon: <MapPinned size={18} />,
                description: t('settingsGeofencesDescription'),
              },
              ...(!features.disableGroups
                ? [
                    {
                      label: t('settingsGroups'),
                      href: '/settings/groups',
                      icon: <Folder size={18} />,
                      description: t('settingsGroupsDescription'),
                    },
                  ]
                : []),
              ...(!features.disableDrivers
                ? [
                    {
                      label: t('sharedDrivers'),
                      href: '/settings/drivers',
                      icon: <UserRound size={18} />,
                      description: t('settingsDriversDescription'),
                    },
                  ]
                : []),
            ],
          },
          {
            title: t('settingsAutomation'),
            collapsible: true,
            items: [
              ...(!features.disableCalendars
                ? [
                    {
                      label: t('sharedCalendars'),
                      href: '/settings/calendars',
                      icon: <CalendarDays size={18} />,
                      description: t('settingsCalendarsDescription'),
                    },
                  ]
                : []),
              ...(!features.disableComputedAttributes
                ? [
                    {
                      label: t('sharedComputedAttributes'),
                      href: '/settings/attributes',
                      icon: <Calculator size={18} />,
                      description: t('settingsComputedAttributesDescription'),
                    },
                  ]
                : []),
              ...(!features.disableMaintenance
                ? [
                    {
                      label: t('sharedMaintenance'),
                      href: '/settings/maintenances',
                      icon: <Wrench size={18} />,
                      description: t('settingsMaintenanceDescription'),
                    },
                  ]
                : []),
              ...(!features.disableSavedCommands
                ? [
                    {
                      label: t('sharedSavedCommands'),
                      href: '/settings/commands',
                      icon: <Send size={18} />,
                      description: t('settingsSavedCommandsDescription'),
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
            title: t('settingsAdministration'),
            collapsible: true,
            items: [
              {
                label: t('serverAnnouncement'),
                href: '/settings/announcement',
                icon: <Megaphone size={18} />,
                description: t('settingsAnnouncementDescription'),
              },
              ...(admin
                ? [
                    {
                      label: t('settingsServer'),
                      href: '/settings/server',
                      icon: <Settings size={18} />,
                      description: t('settingsServerDescription'),
                    },
                  ]
                : []),
              {
                label: t('settingsUsers'),
                href: '/settings/users',
                icon: <Users size={18} />,
                description: t('settingsUsersDescription'),
              },
            ],
          },
        ]
      : []),
    ...(billingLink || supportLink
      ? [
          {
            title: t('settingsResources'),
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
      title={t('settingsTitle')}
      description={t('settingsDescription')}
      groups={groups}
      backHref="/"
      backLabel={t('sharedBackToMap')}
    >
      <div className="h-full min-h-0 overflow-auto bg-(--color-background) p-3 sm:p-4 lg:p-6">
        {children}
      </div>
    </SectionShell>
  );
}
