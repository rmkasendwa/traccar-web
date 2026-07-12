// @ts-nocheck
'use client';
import { useCallback, useReducer, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from '@/lib/router';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Button,
  TableFooter,
  FormControlLabel,
  Switch,
} from '@/components/ui';
import { LinkIcon } from '@/components/ui/icons';
import { useTheme } from '@/components/ui';
import { useAsyncTask, useScrollToLoad, pageSize } from '@/lib/react';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import SettingsMenu from '@/features/settings/components/SettingsMenu';
import CollectionFab from '@/features/settings/components/CollectionFab';
import CollectionActions from '@/features/settings/components/CollectionActions';
import TableShimmer from '@/components/ui/TableShimmer';
import SearchHeader from '@/features/settings/components/SearchHeader';
import { formatAddress, formatStatus, formatTime } from '@/lib/formatter';
import { useDeviceReadonly, useManager } from '@/lib/permissions';
import { usePreference } from '@/lib/preferences';
import useSettingsStyles from '@/features/settings/hooks/useSettingsStyles';
import DeviceUsersValue from '@/features/users/components/DeviceUsersValue';
import usePersistedState from '@/lib/usePersistedState';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import AddressValue from '@/features/positions/components/AddressValue';
import exportExcel from '@/features/reports/lib/exportExcel';
import CollectionEmptyState from '@/features/settings/components/CollectionEmptyState';

const DevicesPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const groups = useSelector((state) => state.groups.items);

  const manager = useManager();
  const deviceReadonly = useDeviceReadonly();
  const coordinateFormat = usePreference('coordinateFormat');

  const positions = useSelector((state) => state.session.positions);

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAll, setShowAll] = usePersistedState('showAllDevices', false);
  const [hasMore, setHasMore] = useState(true);

  const loadItems = useCallback(
    async (offset, signal) => {
      const query = new URLSearchParams({ all: showAll, limit: pageSize, offset });
      if (searchKeyword) {
        query.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/devices?${query.toString()}`, { signal });
      const data = await response.json();
      setItems((previous) => (offset ? [...previous, ...data] : data));
      setHasMore(data.length >= pageSize);
    },
    [searchKeyword, showAll],
  );

  const sentinelRef = useScrollToLoad(() => loadItems(items.length));

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  const handleExport = async () => {
    const data = items.map((item) => ({
      [t('sharedName')]: item.name,
      [t('deviceIdentifier')]: item.uniqueId,
      [t('groupParent')]: item.groupId ? groups[item.groupId]?.name : null,
      [t('sharedPhone')]: item.phone,
      [t('deviceModel')]: item.model,
      [t('deviceContact')]: item.contact,
      [t('userExpirationTime')]: formatTime(item.expirationTime, 'date'),
      [t('deviceStatus')]: formatStatus(item.status, t),
      [t('deviceLastUpdate')]: formatTime(item.lastUpdate, 'minutes'),
      [t('positionAddress')]: positions[item.id]
        ? formatAddress(positions[item.id], coordinateFormat)
        : '',
    }));
    const sheets = new Map();
    sheets.set(t('deviceTitle'), data);
    await exportExcel(t('deviceTitle'), 'devices.xlsx', sheets, theme);
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (deviceId) => navigate(`/settings/device/${deviceId}/connections`),
  };

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'deviceTitle']}>
      <SearchHeader
        keyword={searchKeyword}
        setKeyword={setSearchKeyword}
        editPath="/settings/device"
        addLabel="Add device"
      />
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>{t('sharedName')}</TableCell>
            <TableCell>{t('deviceIdentifier')}</TableCell>
            <TableCell>{t('groupParent')}</TableCell>
            <TableCell>{t('sharedPhone')}</TableCell>
            <TableCell>{t('deviceModel')}</TableCell>
            <TableCell>{t('deviceContact')}</TableCell>
            <TableCell>{t('userExpirationTime')}</TableCell>
            <TableCell>{t('positionAddress')}</TableCell>
            {manager && <TableCell>{t('settingsUsers')}</TableCell>}
            <TableCell className={classes.columnAction} />
          </TableRow>
        </TableHead>
        <TableBody>
          {!hasMore && items.length === 0 && (
            <CollectionEmptyState
              colSpan={manager ? 10 : 9}
              editPath="/settings/device"
              itemName="devices"
              searchKeyword={searchKeyword}
              disabled={deviceReadonly}
            />
          )}
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.uniqueId}</TableCell>
              <TableCell>{item.groupId ? groups[item.groupId]?.name : null}</TableCell>
              <TableCell>{item.phone}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.contact}</TableCell>
              <TableCell>{formatTime(item.expirationTime, 'date')}</TableCell>
              <TableCell>
                {positions[item.id] && (
                  <AddressValue
                    latitude={positions[item.id].latitude}
                    longitude={positions[item.id].longitude}
                    originalAddress={positions[item.id]?.address}
                  />
                )}
              </TableCell>
              {manager && (
                <TableCell>
                  <DeviceUsersValue deviceId={item.id} />
                </TableCell>
              )}
              <TableCell className={classes.columnAction} padding="none">
                <CollectionActions
                  itemId={item.id}
                  editPath="/settings/device"
                  endpoint="devices"
                  onReload={reload}
                  customActions={[actionConnections]}
                  readonly={deviceReadonly}
                />
              </TableCell>
            </TableRow>
          ))}
          {hasMore && (
            <TableShimmer
              ref={items.length > 0 ? sentinelRef : null}
              columns={manager ? 9 : 8}
              endAction
            />
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>
              <Button onClick={handleExport} variant="text">
                {t('reportExport')}
              </Button>
            </TableCell>
            <TableCell colSpan={manager ? 9 : 8} align="right">
              <FormControlLabel
                control={
                  <Switch
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                    size="small"
                  />
                }
                label={t('notificationAlways')}
                labelPlacement="start"
                disabled={!manager}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <CollectionFab editPath="/settings/device" />
    </PageLayout>
  );
};

export default DevicesPage;
