// @ts-nocheck
'use client';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTheme } from '@/components/ui';
import SelectField from '@/components/ui/SelectField';
import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ReportFilter from '@/features/reports/components/ReportFilter';
import { formatTime } from '@/lib/formatter';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import usePositionAttributes from '@/features/positions/hooks/usePositionAttributes';
import { useCatchCallback } from '@/lib/react';
import { useAttributePreference } from '@/lib/preferences';
import {
  altitudeFromMeters,
  distanceFromMeters,
  speedFromKnots,
  speedToKnots,
  volumeFromLiters,
} from '@/lib/converter';
import useReportStyles from '@/features/reports/common/useReportStyles';
import ReportEmptyState from '@/features/reports/components/ReportEmptyState';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const ChartReportPage = () => {
  const { classes } = useReportStyles();
  const theme = useTheme();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');

  const [items, setItems] = useState([]);
  const [types, setTypes] = useState(['speed']);
  const [selectedTypes, setSelectedTypes] = useState(['speed']);
  const [timeType, setTimeType] = useState('fixTime');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const chartItems = useMemo(
    () =>
      items
        .filter((item) => Number.isFinite(item[timeType]))
        .sort((a, b) => a[timeType] - b[timeType]),
    [items, timeType],
  );

  const yDomain = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    chartItems.forEach((item) => {
      selectedTypes.forEach((type) => {
        const value = item[type];
        if (Number.isFinite(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 100];
    const padding = min === max ? Math.max(Math.abs(min) * 0.1, 1) : (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartItems, selectedTypes]);

  const onShow = useCatchCallback(
    async ({ deviceIds, from, to }) => {
      const query = new URLSearchParams({ from, to });
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
      setLoading(true);
      setError('');
      try {
        const response = await fetchOrThrow(`/api/reports/route?${query.toString()}`, {
          headers: { Accept: 'application/json' },
        });
        const positions = await response.json();
        const keySet = new Set();
        const keyList = [];
        const formattedPositions = positions.map((position) => {
          const data = { ...position, ...position.attributes };
          const formatted = {};
          formatted.fixTime = dayjs(position.fixTime).valueOf();
          formatted.deviceTime = dayjs(position.deviceTime).valueOf();
          formatted.serverTime = dayjs(position.serverTime).valueOf();
          Object.keys(data)
            .filter((key) => !['id', 'deviceId'].includes(key))
            .forEach((key) => {
              const value = data[key];
              if (typeof value === 'number') {
                keySet.add(key);
                const definition = positionAttributes[key] || {};
                switch (definition.dataType) {
                  case 'speed':
                    if (key == 'obdSpeed') {
                      formatted[key] = Number(
                        speedFromKnots(speedToKnots(value, 'kmh'), speedUnit).toFixed(2),
                      );
                    } else {
                      formatted[key] = Number(speedFromKnots(value, speedUnit).toFixed(2));
                    }
                    break;
                  case 'altitude':
                    formatted[key] = Number(altitudeFromMeters(value, altitudeUnit).toFixed(2));
                    break;
                  case 'distance':
                    formatted[key] = Number(distanceFromMeters(value, distanceUnit).toFixed(2));
                    break;
                  case 'volume':
                    formatted[key] = Number(volumeFromLiters(value, volumeUnit).toFixed(2));
                    break;
                  case 'hours':
                    formatted[key] = Number((value / 1000).toFixed(2));
                    break;
                  default:
                    formatted[key] = value;
                    break;
                }
              }
            });
          return formatted;
        });
        Object.keys(positionAttributes).forEach((key) => {
          if (keySet.has(key)) {
            keyList.push(key);
            keySet.delete(key);
          }
        });
        const nextTypes = [...keyList, ...keySet];
        setTypes(nextTypes);
        setSelectedTypes((current) => {
          const available = current.filter((type) => nextTypes.includes(type));
          return available.length ? available : nextTypes.slice(0, 1);
        });
        setItems(formattedPositions);
      } catch (reportError) {
        setItems([]);
        setError(reportError instanceof Error ? reportError.message : t('sharedError'));
        throw reportError;
      } finally {
        setLoading(false);
      }
    },
    [positionAttributes, speedUnit, altitudeUnit, distanceUnit, volumeUnit],
  );

  const colorPalette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.text.secondary,
  ];

  return (
    <div className="report-page flex flex-col">
      <ReportFilter
        onShow={onShow}
        onExport={() => {}}
        deviceType="single"
        formats={[]}
        loading={loading}
      >
        <div className={classes.filterItem}>
          <SelectField
            label={t('reportChartType')}
            data={types.map((id) => ({ id, name: positionAttributes[id]?.name || id }))}
            value={selectedTypes}
            onChange={(e) => setSelectedTypes(e.target.value)}
            multiple
            singleLine
            disabled={!items.length}
            fullWidth
          />
        </div>
        <div className={classes.filterItem}>
          <SelectField
            label={t('reportTimeType')}
            data={[
              { id: 'fixTime', name: t('positionFixTime') },
              { id: 'deviceTime', name: t('positionDeviceTime') },
              { id: 'serverTime', name: t('positionServerTime') },
            ]}
            value={timeType}
            onChange={(e) => setTimeType(e.target.value)}
            disabled={!items.length}
            fullWidth
          />
        </div>
      </ReportFilter>
      {loading && (
        <div
          className="grid min-h-64 place-items-center text-sm text-(--color-muted)"
          role="status"
        >
          {t('sharedLoading')}
        </div>
      )}
      {!loading && error && <ReportEmptyState title={t('sharedError')} description={error} />}
      {!loading && !error && !items.length && <ReportEmptyState />}
      {!loading && !error && items.length > 0 && !chartItems.length && (
        <ReportEmptyState
          title="No valid timeline data"
          description="The selected timestamp is missing or invalid for this report."
        />
      )}
      {!loading && !error && chartItems.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
            <LineChart
              data={chartItems}
              margin={{
                top: 10,
                right: 40,
                left: 10,
                bottom: 10,
              }}
            >
              <XAxis
                stroke={theme.palette.text.primary}
                dataKey={timeType}
                type="number"
                tickFormatter={(value) => formatTime(value, 'time')}
                domain={['dataMin', 'dataMax']}
                scale="time"
              />
              <YAxis
                stroke={theme.palette.text.primary}
                type="number"
                tickFormatter={(value) => parseFloat(value.toFixed(2))}
                domain={yDomain}
                allowDataOverflow={false}
              />
              <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
              <Legend
                formatter={(value) => positionAttributes[value]?.name || value}
                wrapperStyle={{ color: theme.palette.text.primary }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                  borderRadius: 8,
                  color: theme.palette.text.primary,
                }}
                formatter={(value, key) => [value, positionAttributes[key]?.name || key]}
                labelFormatter={(value) => formatTime(value, 'seconds')}
              />
              <Brush
                dataKey={timeType}
                height={30}
                stroke={theme.palette.primary.main}
                tickFormatter={() => ''}
              />
              {selectedTypes.map((type, index) => (
                <Line
                  key={type}
                  type="monotone"
                  dataKey={type}
                  stroke={colorPalette[index % colorPalette.length]}
                  dot={false}
                  activeDot={{ r: 6 }}
                  connectNulls
                  isAnimationActive={chartItems.length < 1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ChartReportPage;
