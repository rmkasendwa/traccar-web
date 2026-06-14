// @ts-nocheck
import { Divider, List } from '@/components/ui';
import { TuneIcon } from '@/components/ui/icons';
import { DrawIcon } from '@/components/ui/icons';
import { NotificationsIcon } from '@/components/ui/icons';
import { FolderIcon } from '@/components/ui/icons';
import { PersonIcon } from '@/components/ui/icons';
import { SettingsIcon } from '@/components/ui/icons';
import { BuildIcon } from '@/components/ui/icons';
import { PeopleIcon } from '@/components/ui/icons';
import { TodayIcon } from '@/components/ui/icons';
import { SendIcon } from '@/components/ui/icons';
import { DnsIcon } from '@/components/ui/icons';
import { HelpIcon } from '@/components/ui/icons';
import { PaymentIcon } from '@/components/ui/icons';
import { CampaignIcon } from '@/components/ui/icons';
import { CalculateIcon } from '@/components/ui/icons';
import { useLocation } from '@/lib/router';
import { useSelector } from 'react-redux';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { useAdministrator, useManager, useRestriction } from '@/lib/permissions';
import useFeatures from '@/lib/useFeatures';
import MenuItem from '@/components/ui/MenuItem';

const SettingsMenu = () => {
  const t = useTranslation();
  const location = useLocation();

  const readonly = useRestriction('readonly');
  const admin = useAdministrator();
  const manager = useManager();
  const userId = useSelector((state) => state.session.user.id);
  const supportLink = useSelector((state) => state.session.server.attributes.support);
  const billingLink = useSelector((state) => state.session.user.attributes.billingLink);

  const features = useFeatures();

  return (
    <>
      <List>
        <MenuItem
          title={t('sharedPreferences')}
          link="/settings/preferences"
          icon={<TuneIcon />}
          selected={location.pathname === '/settings/preferences'}
        />
        {!readonly && (
          <>
            <MenuItem
              title={t('sharedNotifications')}
              link="/settings/notifications"
              icon={<NotificationsIcon />}
              selected={location.pathname.startsWith('/settings/notification')}
            />
            <MenuItem
              title={t('settingsUser')}
              link={`/settings/user/${userId}`}
              icon={<PersonIcon />}
              selected={location.pathname === `/settings/user/${userId}`}
            />
            <MenuItem
              title={t('deviceTitle')}
              link="/settings/devices"
              icon={<DnsIcon />}
              selected={location.pathname.startsWith('/settings/device')}
            />
            <MenuItem
              title={t('sharedGeofences')}
              link="/geofences"
              icon={<DrawIcon />}
              selected={location.pathname.startsWith('/settings/geofence')}
            />
            {!features.disableGroups && (
              <MenuItem
                title={t('settingsGroups')}
                link="/settings/groups"
                icon={<FolderIcon />}
                selected={location.pathname.startsWith('/settings/group')}
              />
            )}
            {!features.disableDrivers && (
              <MenuItem
                title={t('sharedDrivers')}
                link="/settings/drivers"
                icon={<PersonIcon />}
                selected={location.pathname.startsWith('/settings/driver')}
              />
            )}
            {!features.disableCalendars && (
              <MenuItem
                title={t('sharedCalendars')}
                link="/settings/calendars"
                icon={<TodayIcon />}
                selected={location.pathname.startsWith('/settings/calendar')}
              />
            )}
            {!features.disableComputedAttributes && (
              <MenuItem
                title={t('sharedComputedAttributes')}
                link="/settings/attributes"
                icon={<CalculateIcon />}
                selected={location.pathname.startsWith('/settings/attribute')}
              />
            )}
            {!features.disableMaintenance && (
              <MenuItem
                title={t('sharedMaintenance')}
                link="/settings/maintenances"
                icon={<BuildIcon />}
                selected={location.pathname.startsWith('/settings/maintenance')}
              />
            )}
            {!features.disableSavedCommands && (
              <MenuItem
                title={t('sharedSavedCommands')}
                link="/settings/commands"
                icon={<SendIcon />}
                selected={location.pathname.startsWith('/settings/command')}
              />
            )}
          </>
        )}
        {billingLink && (
          <MenuItem title={t('userBilling')} link={billingLink} icon={<PaymentIcon />} />
        )}
        {supportLink && (
          <MenuItem title={t('settingsSupport')} link={supportLink} icon={<HelpIcon />} />
        )}
      </List>
      {manager && (
        <>
          <Divider />
          <List>
            <MenuItem
              title={t('serverAnnouncement')}
              link="/settings/announcement"
              icon={<CampaignIcon />}
              selected={location.pathname === '/settings/announcement'}
            />
            {admin && (
              <MenuItem
                title={t('settingsServer')}
                link="/settings/server"
                icon={<SettingsIcon />}
                selected={location.pathname === '/settings/server'}
              />
            )}
            <MenuItem
              title={t('settingsUsers')}
              link="/settings/users"
              icon={<PeopleIcon />}
              selected={
                location.pathname.startsWith('/settings/user') &&
                location.pathname !== `/settings/user/${userId}`
              }
            />
          </List>
        </>
      )}
    </>
  );
};

export default SettingsMenu;
