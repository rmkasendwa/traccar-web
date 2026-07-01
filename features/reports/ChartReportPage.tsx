// @ts-nocheck
'use client';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTheme } from '@/components/ui';
import SelectField from '@/components/ui/SelectField';
import {
  Brush,
  CartesianGrid,
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

  const values = items.map((it) =>
    selectedTypes.map((type) => it[type]).filter((value) => value != null),
  );
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 100;
  const valueRange = maxValue - minValue;

  const onShow = useCatchCallback(
    async ({ deviceIds, from, to }) => {
      const query = new URLSearchParams({ from, to });
      deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
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
                    formatted[key] = speedFromKnots(speedToKnots(value, 'kmh'), speedUnit).toFixed(
                      2,
                    );
                  } else {
                    formatted[key] = speedFromKnots(value, speedUnit).toFixed(2);
                  }
                  break;
                case 'altitude':
                  formatted[key] = altitudeFromMeters(value, altitudeUnit).toFixed(2);
                  break;
                case 'distance':
                  formatted[key] = distanceFromMeters(value, distanceUnit).toFixed(2);
                  break;
                case 'volume':
                  formatted[key] = volumeFromLiters(value, volumeUnit).toFixed(2);
                  break;
                case 'hours':
                  formatted[key] = (value / 1000).toFixed(2);
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
      setTypes([...keyList, ...keySet]);
      setItems(formattedPositions);
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
    <div className="report-page">
      <ReportFilter onShow={onShow} onExport={() => {}} deviceType="single" formats={[]}>
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
      {!items.length && <ReportEmptyState />}
      {items.length > 0 && (
        <div className={classes.chart}>
          <ResponsiveContainer>
            <LineChart
              data={items}
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
                domain={[minValue - valueRange / 5, maxValue + valueRange / 5]}
              />
              <CartesianGrid stroke={theme.palette.divider} strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.default,
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
