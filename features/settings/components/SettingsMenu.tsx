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
import { routes } from '@/lib/routes';
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
          link={routes.settings.preferences}
          icon={<TuneIcon />}
          selected={location.pathname === routes.settings.preferences}
        />
        {!readonly && (
          <>
            <MenuItem
              title={t('sharedNotifications')}
              link={routes.settings.notifications}
              icon={<NotificationsIcon />}
              selected={location.pathname.startsWith(routes.settings.notification.base)}
            />
            <MenuItem
              title={t('settingsUser')}
              link={routes.settings.user.detail(userId)}
              icon={<PersonIcon />}
              selected={location.pathname === routes.settings.user.detail(userId)}
            />
            <MenuItem
              title={t('deviceTitle')}
              link={routes.settings.devices}
              icon={<DnsIcon />}
              selected={location.pathname.startsWith(routes.settings.device.base)}
            />
            <MenuItem
              title={t('sharedGeofences')}
              link={routes.geofences}
              icon={<DrawIcon />}
              selected={location.pathname.startsWith(routes.settings.geofence.base)}
            />
            {!features.disableGroups && (
              <MenuItem
                title={t('settingsGroups')}
                link={routes.settings.groups}
                icon={<FolderIcon />}
                selected={location.pathname.startsWith(routes.settings.group.base)}
              />
            )}
            {!features.disableDrivers && (
              <MenuItem
                title={t('sharedDrivers')}
                link={routes.settings.drivers}
                icon={<PersonIcon />}
                selected={location.pathname.startsWith(routes.settings.driver.base)}
              />
            )}
            {!features.disableCalendars && (
              <MenuItem
                title={t('sharedCalendars')}
                link={routes.settings.calendars}
                icon={<TodayIcon />}
                selected={location.pathname.startsWith(routes.settings.calendar.base)}
              />
            )}
            {!features.disableComputedAttributes && (
              <MenuItem
                title={t('sharedComputedAttributes')}
                link={routes.settings.attributes}
                icon={<CalculateIcon />}
                selected={location.pathname.startsWith(routes.settings.attribute.base)}
              />
            )}
            {!features.disableMaintenance && (
              <MenuItem
                title={t('sharedMaintenance')}
                link={routes.settings.maintenances}
                icon={<BuildIcon />}
                selected={location.pathname.startsWith(routes.settings.maintenance.base)}
              />
            )}
            {!features.disableSavedCommands && (
              <MenuItem
                title={t('sharedSavedCommands')}
                link={routes.settings.commands}
                icon={<SendIcon />}
                selected={location.pathname.startsWith(routes.settings.command.base)}
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
              link={routes.settings.announcement}
              icon={<CampaignIcon />}
              selected={location.pathname === routes.settings.announcement}
            />
            {admin && (
              <MenuItem
                title={t('settingsServer')}
                link={routes.settings.server}
                icon={<SettingsIcon />}
                selected={location.pathname === routes.settings.server}
              />
            )}
            <MenuItem
              title={t('settingsUsers')}
              link={routes.settings.users}
              icon={<PeopleIcon />}
              selected={
                location.pathname.startsWith(routes.settings.user.base) &&
                location.pathname !== routes.settings.user.detail(userId)
              }
            />
          </List>
        </>
      )}
    </>
  );
};

export default SettingsMenu;
