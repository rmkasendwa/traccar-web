// @ts-nocheck
'use client';

import MapCamera from '@/features/map/MapCamera';
import MapGeofence from '@/features/map/MapGeofence';
import MapMarkers from '@/features/map/MapMarkers';
import MapRouteCoordinates from '@/features/map/MapRouteCoordinates';
import MapScale from '@/features/map/MapScale';
import MapView from '@/features/map/core/MapView';
import ResizeHandle from '@/features/reports/components/ResizeHandle';

type CombinedReportMapProps = {
  containerClassName: string;
  devices: Record<number, { name: string }>;
  items: any[];
};

export default function CombinedReportMap({
  containerClassName,
  devices,
  items,
}: CombinedReportMapProps) {
  const coordinates = items.flatMap((item) => item.route);
  const markers = items.flatMap((item) =>
    item.events
      .map((event) => item.positions.find((position) => event.positionId === position.id))
      .filter(Boolean)
      .map((position) => ({
        latitude: position.latitude,
        longitude: position.longitude,
      })),
  );

  return (
    <>
      <div className={containerClassName}>
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
          <MapMarkers markers={markers} />
        </MapView>
        <MapScale />
        <MapCamera coordinates={coordinates} />
      </div>
      <ResizeHandle />
    </>
  );
}
