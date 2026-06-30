// @ts-nocheck
import { useMemo, useState } from 'react';
import { useSearchParams } from '@/lib/router';
import { useSelector } from 'react-redux';
import { useTheme } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui';
import { formatNumericHours, formatTime } from '@/lib/formatter';
import ReportFilter, { updateReportParams } from '@/features/reports/components/ReportFilter';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import ColumnSelect from '@/features/reports/components/ColumnSelect';
import usePersistedState from '@/lib/usePersistedState';
import { useCatch, useCatchCallback } from '@/lib/react';
import useReportStyles from '@/features/reports/common/useReportStyles';
import TableShimmer from '@/components/ui/TableShimmer';
import ReportEmptyState from '@/features/reports/components/ReportEmptyState';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import SelectField from '@/components/ui/SelectField';
import exportExcel from '@/features/reports/lib/exportExcel';
import { deviceEquality } from '@/features/devices/lib/deviceEquality';

const columnsArray = [
  ['geofenceId', 'sharedGeofence'],
  ['startTime', 'reportStartTime'],
  ['endTime', 'reportEndTime'],
  ['duration', 'reportDuration'],
];
const columnsMap = new Map(columnsArray);

const GeofenceReportPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
  const geofenceIds = useMemo(() => searchParams.getAll('geofenceId').map(Number), [searchParams]);

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));
  const geofences = useSelector((state) => state.geofences.items);

  const [columns, setColumns] = usePersistedState('geofenceColumns', [
    'geofenceId',
    'startTime',
    'endTime',
  ]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const onShow = useCatchCallback(
    async ({ deviceIds, groupIds, from, to }) => {
      const query = new URLSearchParams({ from, to });
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
      groupIds.forEach((groupId) => query.append('groupId', groupId));
      geofenceIds.forEach((geofenceId) => query.append('geofenceId', geofenceId));
      setLoading(true);
      try {
        const response = await fetchOrThrow(`/api/reports/geofences?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        setItems(await response.json());
      } finally {
        setLoading(false);
      }
    },
    [geofenceIds],
  );

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
        row[header] = formatValue(item, key);
      });
      sheets.get(deviceName).push(row);
    });
    await exportExcel(t('sharedGeofences'), 'geofences.xlsx', sheets, theme);
  });

  const formatValue = (item, key) => {
    switch (key) {
      case 'geofenceId':
        return geofences[item.geofenceId]?.name || item.geofenceId;
      case 'startTime':
      case 'endTime':
        return formatTime(item[key], 'minutes');
      case 'duration':
        return formatNumericHours(Date.parse(item.endTime) - Date.parse(item.startTime), t);
      default:
        return item[key];
    }
  };

  return (
    <div className="report-page">
      <div className={classes.header}>
        <ReportFilter
          onShow={onShow}
          onExport={onExport}
          deviceType="multiple"
          loading={loading}
          formats={['xlsx']}
        >
          <div className={classes.filterItem}>
            <SelectField
              label={t('sharedGeofences')}
              value={geofenceIds}
              onChange={(e) =>
                updateReportParams(searchParams, setSearchParams, 'geofenceId', e.target.value)
              }
              endpoint="/api/geofences"
              multiple
              singleLine
              fullWidth
            />
          </div>
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>
      {!loading && !items.length ? (
        <ReportEmptyState />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('sharedDevice')}</TableCell>
              {columns.map((key) => (
                <TableCell key={key}>{t(columnsMap.get(key))}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading ? (
              items.map((item) => (
                <TableRow
                  key={`${item.deviceId}_${item.geofenceId}_${item.startTime}_${item.endTime}`}
                >
                  <TableCell>{devices[item.deviceId]?.name || item.deviceId}</TableCell>
                  {columns.map((key) => (
                    <TableCell key={key}>{formatValue(item, key)}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableShimmer columns={columns.length + 1} />
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default GeofenceReportPage;
