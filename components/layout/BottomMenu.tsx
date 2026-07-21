// @ts-nocheck
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from '@/lib/router';
import { routes } from '@/lib/routes';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Menu,
  MenuItem,
  Typography,
  Badge,
} from '@/components/ui';

import { DescriptionIcon } from '@/components/ui/icons';
import { SettingsIcon } from '@/components/ui/icons';
import { MapIcon } from '@/components/ui/icons';
import { PersonIcon } from '@/components/ui/icons';
import { ExitToAppIcon } from '@/components/ui/icons';

import { sessionActions } from '@/store';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { useRestriction } from '@/lib/permissions';
import { nativePostMessage } from '@/controllers/NativeInterface';

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();

  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const devices = useSelector((state) => state.devices.items);
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const [anchorEl, setAnchorEl] = useState(null);

  const reportsLink = () => {
    let id = selectedDeviceId;
    if (id == null) {
      const deviceIds = Object.keys(devices);
      if (deviceIds.length === 1) {
        [id] = deviceIds;
      }
    }
    return routes.reports.combinedForDevice(id);
  };

  const currentSelection = () => {
    if (location.pathname === routes.settings.user.detail(user.id)) {
      return 'account';
    }
    if (location.pathname.startsWith(routes.settings.index)) {
      return 'settings';
    }
    if (location.pathname.startsWith(routes.reports.index)) {
      return 'reports';
    }
    if (location.pathname === routes.home) {
      return 'map';
    }
    return null;
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(routes.settings.user.detail(user.id));
  };

  const handleLogout = async () => {
    setAnchorEl(null);

    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens:
              tokens.length > 1
                ? tokens.filter((it) => it !== notificationToken).join(',')
                : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate(routes.login);
    dispatch(sessionActions.updateUser(null));
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'account':
        event.preventDefault();
        setAnchorEl(event.currentTarget);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <Paper square elevation={3}>
      <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels>
        <BottomNavigationAction
          component={Link}
          to={routes.home}
          label={t('mapTitle')}
          icon={
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          }
          value="map"
        />
        {!disableReports && (
          <BottomNavigationAction
            component={Link}
            to={reportsLink()}
            label={t('reportTitle')}
            icon={<DescriptionIcon />}
            value="reports"
          />
        )}
        {!readonly && (
          <BottomNavigationAction
            component={Link}
            to={routes.settings.preferencesMenu}
            label={t('settingsTitle')}
            icon={<SettingsIcon />}
            value="settings"
          />
        )}
        {readonly ? (
          <BottomNavigationAction
            label={t('loginLogout')}
            icon={<ExitToAppIcon />}
            value="logout"
          />
        ) : (
          <BottomNavigationAction
            component={Link}
            to={routes.settings.user.detail(user.id)}
            label={t('settingsUser')}
            icon={<PersonIcon />}
            value="account"
          />
        )}
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleAccount}>
          <Typography color="textPrimary">{t('settingsUser')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Typography color="error">{t('loginLogout')}</Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default BottomMenu;
