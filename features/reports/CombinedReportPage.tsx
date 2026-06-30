// @ts-nocheck
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui';
import ReportFilter from '@/features/reports/components/ReportFilter';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import ResizeHandle from '@/features/reports/components/ResizeHandle';
import { useCatchCallback } from '@/lib/react';
import MapView from '@/features/map/core/MapView';
import useReportStyles from '@/features/reports/common/useReportStyles';
import TableShimmer from '@/components/ui/TableShimmer';
import ReportEmptyState from '@/features/reports/components/ReportEmptyState';
import MapCamera from '@/features/map/MapCamera';
import MapGeofence from '@/features/map/MapGeofence';
import { formatTime } from '@/lib/formatter';
import { prefixString } from '@/lib/stringUtils';
import MapMarkers from '@/features/map/MapMarkers';
import MapRouteCoordinates from '@/features/map/MapRouteCoordinates';
import MapScale from '@/features/map/MapScale';
import fetchOrThrow from '@/lib/api/fetchOrThrow';
import { deviceEquality } from '@/features/devices/lib/deviceEquality';

const CombinedReportPage = () => {
  const { classes } = useReportStyles();
  const t = useTranslation();

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const itemsCoordinates = useMemo(() => items.flatMap((item) => item.route), [items]);

  const createMarkers = () =>
    items.flatMap((item) =>
      item.events
        .map((event) => item.positions.find((p) => event.positionId === p.id))
        .filter((position) => position != null)
        .map((position) => ({
          latitude: position.latitude,
          longitude: position.longitude,
        })),
    );

  const onShow = useCatchCallback(async ({ deviceIds, groupIds, from, to }) => {
    const query = new URLSearchParams({ from, to });
    deviceIds.forEach((deviceId) => query.append('deviceId', deviceId));
    groupIds.forEach((groupId) => query.append('groupId', groupId));
    setLoading(true);
    try {
      const response = await fetchOrThrow(`/api/reports/combined?${query.toString()}`);
      setItems(await response.json());
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="report-page">
      <div className={classes.container}>
        {Boolean(items.length) && (
          <>
            <div className={classes.containerMap}>
              <MapView>
                <MapGeofence />
                {items.map((item) => (
                  <MapRouteCoordinates
                    key={item.deviceId}
                    name={devices[item.deviceId].name}
                    coordinates={item.route}
                    deviceId={item.deviceId}
                  />
                ))}
                <MapMarkers markers={createMarkers()} />
              </MapView>
              <MapScale />
              <MapCamera coordinates={itemsCoordinates} />
            </div>
            <ResizeHandle />
          </>
        )}
        <div className={classes.containerMain}>
          <div className={classes.header}>
            <ReportFilter onShow={onShow} deviceType="multiple" loading={loading} />
          </div>
          {!loading && !items.length ? (
            <ReportEmptyState />
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('sharedDevice')}</TableCell>
                  <TableCell>{t('positionFixTime')}</TableCell>
                  <TableCell>{t('sharedType')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading ? (
                  items.flatMap((item) =>
                    item.events.map((event, index) => (
                      <TableRow key={event.id}>
                        <TableCell>{index ? '' : devices[item.deviceId].name}</TableCell>
                        <TableCell>{formatTime(event.eventTime, 'seconds')}</TableCell>
                        <TableCell>{t(prefixString('event', event.type))}</TableCell>
                      </TableRow>
                    )),
                  )
                ) : (
                  <TableShimmer columns={3} />
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombinedReportPage;
