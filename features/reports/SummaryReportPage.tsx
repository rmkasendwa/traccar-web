// @ts-nocheck
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from '@/lib/router';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui';
import { useTheme } from '@/components/ui';
import {
  formatDistance,
  formatSpeed,
  formatVolume,
  formatTime,
  formatNumericHours,
} from '@/lib/formatter';
import ReportFilter, { updateReportParams } from '@/features/reports/components/ReportFilter';
import { useAttributePreference } from '@/lib/preferences';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import PageLayout from '@/components/layout/PageLayout';
import ReportsMenu from '@/features/reports/components/ReportsMenu';
import usePersistedState from '@/lib/usePersistedState';
import ColumnSelect from '@/features/reports/components/ColumnSelect';
import { useCatch, useCatchCallback } from '@/lib/react';
import useReportStyles from '@/features/reports/common/useReportStyles';
import TableShimmer from '@/components/ui/TableShimmer';
import scheduleReport from '@/features/reports/common/scheduleReport';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import exportExcel from '@/features/reports/lib/exportExcel';
import { deviceEquality } from '@/features/devices/lib/deviceEquality';

const columnsArray = [
  ['startTime', 'reportStartDate'],
  ['distance', 'sharedDistance'],
  ['startOdometer', 'reportStartOdometer'],
  ['endOdometer', 'reportEndOdometer'],
  ['averageSpeed', 'reportAverageSpeed'],
  ['maxSpeed', 'reportMaximumSpeed'],
  ['engineHours', 'reportEngineHours'],
  ['startHours', 'reportStartEngineHours'],
  ['endHours', 'reportEndEngineHours'],
  ['spentFuel', 'reportSpentFuel'],
];
const columnsMap = new Map(columnsArray);

const SummaryReportPage = () => {
  const navigate = useNavigate();
  const { classes } = useReportStyles();
  const t = useTranslation();
  const theme = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));

  const distanceUnit = useAttributePreference('distanceUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const [columns, setColumns] = usePersistedState('summaryColumns', [
    'startTime',
    'distance',
    'averageSpeed',
  ]);
  const daily = searchParams.get('daily') === 'true';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const onShow = useCatchCallback(
    async ({ deviceIds, groupIds, from, to }) => {
      const query = new URLSearchParams({ from, to, daily });
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
      groupIds.forEach((groupId) => query.append('groupId', groupId));
      setLoading(true);
      try {
        const response = await fetchOrThrow(`/api/reports/summary?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        setItems(await response.json());
      } finally {
        setLoading(false);
      }
    },
    [daily],
  );

  const onExport = useCatch(async () => {
    const rows = [];
    const deviceHeader = t('sharedDevice');
    items.forEach((item) => {
      const row = { [deviceHeader]: devices[item.deviceId].name };
      columns.forEach((key) => {
        const header = t(columnsMap.get(key));
        row[header] = formatValue(item, key);
      });
      rows.push(row);
    });
    if (rows.length === 0) {
      return;
    }
    const titleKey = daily ? 'reportDaily' : 'reportSummary';
    const title = t(titleKey);
    const sheets = new Map([[title, rows]]);
    await exportExcel(title, 'summary.xlsx', sheets, theme);
  });

  const onSchedule = useCatch(async (deviceIds, groupIds, report) => {
    report.type = 'summary';
    report.attributes.daily = daily;
    await scheduleReport(deviceIds, groupIds, report);
    navigate('/reports/scheduled');
  });

  const formatValue = (item, key) => {
    const value = item[key];
    switch (key) {
      case 'deviceId':
        return devices[value].name;
      case 'startTime':
        return formatTime(value, 'date');
      case 'startOdometer':
      case 'endOdometer':
      case 'distance':
        return formatDistance(value, distanceUnit, t);
      case 'averageSpeed':
      case 'maxSpeed':
        return value > 0 ? formatSpeed(value, speedUnit, t) : null;
      case 'engineHours':
      case 'startHours':
      case 'endHours':
        return value > 0 ? formatNumericHours(value, t) : null;
      case 'spentFuel':
        return value > 0 ? formatVolume(value, volumeUnit, t) : null;
      default:
        return value;
    }
  };

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['reportTitle', 'reportSummary']}>
      <div className={classes.header}>
        <ReportFilter
          onShow={onShow}
          onExport={onExport}
          onSchedule={onSchedule}
          deviceType="multiple"
          loading={loading}
          formats={['xlsx']}
        >
          <div className={classes.filterItem}>
            <FormControl fullWidth>
              <InputLabel>{t('sharedType')}</InputLabel>
              <Select
                label={t('sharedType')}
                value={daily}
                onChange={(e) =>
                  updateReportParams(searchParams, setSearchParams, 'daily', [
                    String(e.target.value),
                  ])
                }
              >
                <MenuItem value={false}>{t('reportSummary')}</MenuItem>
                <MenuItem value>{t('reportDaily')}</MenuItem>
              </Select>
            </FormControl>
          </div>
          <ColumnSelect columns={columns} setColumns={setColumns} columnsArray={columnsArray} />
        </ReportFilter>
      </div>
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
              <TableRow key={`${item.deviceId}_${Date.parse(item.startTime)}`}>
                <TableCell>{devices[item.deviceId].name}</TableCell>
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
    </PageLayout>
  );
};

export default SummaryReportPage;
