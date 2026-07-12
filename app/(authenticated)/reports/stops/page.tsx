// @ts-nocheck
'use client';
import { useState } from 'react';
import { useNavigate } from '@/lib/router';
import { useSelector } from 'react-redux';
import { useTheme } from '@/components/ui';
import { IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui';
import { GpsFixedIcon } from '@/components/ui/icons';
import { LocationSearchingIcon } from '@/components/ui/icons';
import {
  formatAddress,
  formatDistance,
  formatVolume,
  formatTime,
  formatNumericHours,
} from '@/lib/formatter';
import ReportFilter from '@/features/reports/components/ReportFilter';
import { useAttributePreference, usePreference } from '@/lib/preferences';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import ColumnSelect from '@/features/reports/components/ColumnSelect';
import ResizeHandle from '@/features/reports/components/ResizeHandle';
import usePersistedState from '@/lib/usePersistedState';
import { useCatch, useCatchCallback } from '@/lib/react';
import useReportStyles from '@/features/reports/common/useReportStyles';
import MapPositions from '@/features/map/MapPositions';
import MapView from '@/features/map/core/MapView';
import MapCamera from '@/features/map/MapCamera';
import AddressValue from '@/features/positions/components/AddressValue';
import TableShimmer from '@/components/ui/TableShimmer';
import ReportEmptyState from '@/features/reports/components/ReportEmptyState';
import MapGeofence from '@/features/map/MapGeofence';
import scheduleReport from '@/features/reports/common/scheduleReport';
import MapScale from '@/features/map/MapScale';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import exportExcel from '@/features/reports/lib/exportExcel';
import { deviceEquality } from '@/features/devices/lib/deviceEquality';

const columnsArray = [
  ['startTime', 'reportStartTime'],
  ['startOdometer', 'positionOdometer'],
  ['address', 'positionAddress'],
  ['endTime', 'reportEndTime'],
  ['duration', 'reportDuration'],
  ['engineHours', 'reportEngineHours'],
  ['spentFuel', 'reportSpentFuel'],
];
const columnsMap = new Map(columnsArray);

const StopReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));

  const distanceUnit = useAttributePreference('distanceUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');

  const [columns, setColumns] = usePersistedState('stopColumns', [
    'startTime',
    'endTime',
    'startOdometer',
    'address',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const onShow = useCatchCallback(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    setLoading(true);
    try {
      const response = await fetchOrThrow(`/api/reports/stops?${query.toString()}`, {
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
        if (key === 'address') {
          row[header] = formatAddress(item, coordinateFormat);
        } else {
          row[header] = formatValue(item, key);
        }
      });
      sheets.get(deviceName).push(row);
    });
    await exportExcel(t('reportStops'), 'stops.xlsx', sheets, theme);
  });

  const onSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'stops';
    await scheduleReport(deviceIds, groupIds, report);
    navigate('/reports/scheduled');
  });

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'deviceId':
        return devices[value].name;
      case 'startTime':
      case 'endTime':
        return formatTime(value, 'minutes');
      case 'startOdometer':
        return formatDistance(value, distanceUnit, t);
      case 'duration':
        return formatNumericHours(value, t);
      case 'engineHours':
        return value > 0 ? formatNumericHours(value, t) : null;
      case 'spentFuel':
        return value > 0 ? formatVolume(value, volumeUnit, t) : null;
      case 'address':
        return (
          <AddressValue
            latitude={item.latitude}
            longitude={item.longitude}
            originalAddress={value}
          />
        );
      default:
        return value;
    }
  };

  return (
    <div className="report-page">
      <div className={classes.container}>
        {selectedItem && (
          <>
            <div className={classes.containerMap}>
              <MapView>
                <MapGeofence />
                <MapPositions
                  positions={[
                    {
                      deviceId: selectedItem.deviceId,
                      fixTime: selectedItem.startTime,
                      latitude: selectedItem.latitude,
                      longitude: selectedItem.longitude,
                    },
                  ]}
                  titleField="fixTime"
                />
              </MapView>
              <MapScale />
              <MapCamera latitude={selectedItem.latitude} longitude={selectedItem.longitude} />
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
          {!loading && !items.length ? (
            <ReportEmptyState />
          ) : (
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
                    <TableRow key={item.positionId}>
                      <TableCell className={classes.columnAction} padding="none">
                        {selectedItem === item ? (
                          <IconButton size="small" onClick={() => setSelectedItem(null)}>
                            <GpsFixedIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton size="small" onClick={() => setSelectedItem(item)}>
                            <LocationSearchingIcon fontSize="small" />
                          </IconButton>
                        )}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StopReportPage;
