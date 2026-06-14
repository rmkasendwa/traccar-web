// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useSelector } from 'react-redux';
import { useTheme } from '@/components/ui';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui';
import { GpsFixedIcon } from '@/components/ui/icons';
import { LocationSearchingIcon } from '@/components/ui/icons';
import { RouteIcon } from '@/components/ui/icons';
import {
  formatAddress,
  formatDistance,
  formatSpeed,
  formatVolume,
  formatTime,
  formatNumericHours,
} from '@/lib/formatter';
import ReportFilter from '@/features/reports/components/ReportFilter';
import { useAttributePreference, usePreference } from '@/lib/preferences';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import ReportsMenu from '@/features/reports/components/ReportsMenu';
import ColumnSelect from '@/features/reports/components/ColumnSelect';
import ResizeHandle from '@/features/reports/components/ResizeHandle';
import usePersistedState from '@/lib/usePersistedState';
import { useCatch, useCatchCallback, useAsyncTask } from '@/lib/react';
import useReportStyles from '@/features/reports/common/useReportStyles';
import MapView from '@/features/map/core/MapView';
import MapRoutePath from '@/features/map/MapRoutePath';
import AddressValue from '@/features/positions/components/AddressValue';
import TableShimmer from '@/components/ui/TableShimmer';
import MapMarkers from '@/features/map/MapMarkers';
import MapCamera from '@/features/map/MapCamera';
import MapGeofence from '@/features/map/MapGeofence';
import scheduleReport from '@/features/reports/common/scheduleReport';
import MapScale from '@/features/map/MapScale';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import exportExcel from '@/features/reports/lib/exportExcel';
import { deviceEquality } from '@/features/devices/lib/deviceEquality';

const columnsArray = [
  ['startTime', 'reportStartTime'],
  ['startOdometer', 'reportStartOdometer'],
  ['startAddress', 'reportStartAddress'],
  ['endTime', 'reportEndTime'],
  ['endOdometer', 'reportEndOdometer'],
  ['endAddress', 'reportEndAddress'],
  ['distance', 'sharedDistance'],
  ['averageSpeed', 'reportAverageSpeed'],
  ['maxSpeed', 'reportMaximumSpeed'],
  ['duration', 'reportDuration'],
  ['spentFuel', 'reportSpentFuel'],
  ['driverName', 'sharedDriver'],
];
const columnsMap = new Map(columnsArray);

const TripReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));

  const distanceUnit = useAttributePreference('distanceUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');

  const [columns, setColumns] = usePersistedState('tripColumns', [
    'startTime',
    'endTime',
    'distance',
    'averageSpeed',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [route, setRoute] = useState(null);

  const createMarkers = () => [
    {
      latitude: selectedItem.startLat,
      longitude: selectedItem.startLon,
      image: 'start-success',
    },
    {
      latitude: selectedItem.endLat,
      longitude: selectedItem.endLon,
      image: 'finish-error',
    },
  ];

  useAsyncTask(
    async ({ signal }) => {
      if (selectedItem) {
        const query = new URLSearchParams({
          deviceId: selectedItem.deviceId,
          from: selectedItem.startTime,
          to: selectedItem.endTime,
        });
        const response = await fetchOrThrow(`/api/reports/route?${query.toString()}`, {
          headers: { Accept: 'application/json' },
          signal,
        });
        setRoute(await response.json());
      } else {
        setRoute(null);
      }
    },
    [selectedItem],
  );

  const onShow = useCatchCallback(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    setLoading(true);
    try {
      const response = await fetchOrThrow(`/api/reports/trips?${query.toString()}`, {
        headers: { Accept: 'application/json' },
      });
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const onExport = useCatch(async () => {
    const sheets = new Map();
    items.forEach((item) => {
      const deviceName = devices[item.deviceId].name;
      if (!sheets.has(deviceName)) {
        sheets.set(deviceName, []);
      }
      const row = {};
      columns.forEach((key) => {
        const header = t(columnsMap.get(key));
        if (key === 'startAddress') {
          row[header] = formatAddress(
            {
              address: item.startAddress,
              latitude: item.startLat,
              longitude: item.startLon,
            },
            coordinateFormat,
          );
        } else if (key === 'endAddress') {
          row[header] = formatAddress(
            {
              address: item.endAddress,
              latitude: item.endLat,
              longitude: item.endLon,
            },
            coordinateFormat,
          );
        } else {
          row[header] = formatValue(item, key);
        }
      });
      sheets.get(deviceName).push(row);
    });
    await exportExcel(t('reportTrips'), 'trips.xlsx', sheets, theme);
  });

  const onSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'trips';
    await scheduleReport(deviceIds, groupIds, report);
    navigate('/reports/scheduled');
  });

  const navigateToReplay = (item) => {
    navigate({
      pathname: '/replay',
      search: new URLSearchParams({
        from: item.startTime,
        to: item.endTime,
        deviceId: item.deviceId,
      }).toString(),
    });
  };

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'deviceId':
        return devices[value].name;
      case 'startTime':
      case 'endTime':
        return formatTime(value, 'minutes');
      case 'startOdometer':
      case 'endOdometer':
      case 'distance':
        return formatDistance(value, distanceUnit, t);
      case 'averageSpeed':
      case 'maxSpeed':
        return value > 0 ? formatSpeed(value, speedUnit, t) : null;
      case 'duration':
        return formatNumericHours(value, t);
      case 'spentFuel':
        return value > 0 ? formatVolume(value, volumeUnit, t) : null;
      case 'startAddress':
        return (
          <AddressValue
            latitude={item.startLat}
            longitude={item.startLon}
            originalAddress={value}
          />
        );
      case 'endAddress':
        return (
          <AddressValue latitude={item.endLat} longitude={item.endLon} originalAddress={value} />
        );
      default:
        return value;
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportTrips']}>
      <div className={classes.container}>
        {selectedItem && (
          <>
            <div className={classes.containerMap}>
              <MapView>
                <MapGeofence />
                {route && (
                  <>
                    <MapRoutePath positions={route} />
                    <MapMarkers markers={createMarkers()} />
                    <MapCamera positions={route} />
                  </>
                )}
              </MapView>
              <MapScale />
            </div>
            <ResizeHandle />
          </>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter
              onShow={onShow}
              onExport={onExport}
              onSchedule={onSchedule}
              deviceType="multiple"
              loading={loading}
              formats={['xlsx']}
            >
              <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
            </ReportFilter>
          </div>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.columnAction} />
                <TableCell>{t('sharedDevice')}</TableCell>
                {columns.map((key) => (
                  <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading ? (
                items.map((item) => (
                  <TableRow key={item.startPositionId}>
                    <TableCell className={classes.columnAction} padding="none">
                      <div className={classes.columnActionContainer}>
                        {selectedItem === item ? (
                          <IconButton size="small" onClick={() => setSelectedItem(null)}>
                            <GpsFixedIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton size="small" onClick={() => setSelectedItem(item)}>
                            <LocationSearchingIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => navigateToReplay(item)}>
                          <RouteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </TableCell>
                    <TableCell>{devices[item.deviceId].name}</TableCell>
                    {columns.map((key) => (
                      <TableCell key={key}>{formatValue(item, key)}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableShimmer columns={columns.length + 2} startAction />
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  );
};

export default TripReportPage;
