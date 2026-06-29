'use client';

import { memo, useCallback, useEffect, useId, useState } from 'react';
import MapView from '@/features/map/core/MapView';
import MapRoutePath from '@/features/map/MapRoutePath';
import MapRoutePoints from '@/features/map/MapRoutePoints';
import MapCamera from '@/features/map/MapCamera';
import MapGeofence from '@/features/map/MapGeofence';
import MapScale from '@/features/map/MapScale';
import MapPadding from '@/features/map/MapPadding';
import MapOverlay from '@/features/map/overlay/MapOverlay';
import { map } from '@/features/map/core/MapView';
import { toMapCoordinates } from '@/features/map/core/mapUtil';
import { useMediaQuery, useTheme } from '@/components/ui';
import type { ReplayPosition } from '@/features/replay/types';

type ReplayMapProps = {
  positions: ReplayPosition[];
  currentPosition?: ReplayPosition;
  onSelectPosition: (index: number) => void;
};

function CurrentPositionMarker({
  position,
  onClick,
}: {
  position: ReplayPosition;
  onClick: () => void;
}) {
  const id = useId();

  useEffect(() => {
    const handleMouseEnter = () => (map.getCanvas().style.cursor = 'pointer');
    const handleMouseLeave = () => (map.getCanvas().style.cursor = '');
    const handleClick = (event: { preventDefault: () => void }) => {
      event.preventDefault();
      onClick();
    };

    map.addSource(id, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map.addLayer({
      id,
      type: 'circle',
      source: id,
      paint: {
        'circle-radius': 9,
        'circle-color': '#0284c7',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 3,
      },
    });
    map.on('mouseenter', id, handleMouseEnter);
    map.on('mouseleave', id, handleMouseLeave);
    map.on('click', id, handleClick);

    return () => {
      map.off('mouseenter', id, handleMouseEnter);
      map.off('mouseleave', id, handleMouseLeave);
      map.off('click', id, handleClick);
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    };
  }, [id, onClick]);

  useEffect(() => {
    const source = map.getSource(id) as { setData?: (data: object) => void } | undefined;
    source?.setData?.({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: toMapCoordinates(position.longitude, position.latitude),
          },
          properties: {},
        },
      ],
    });
  }, [id, position]);

  return null;
}

function ReplayMap({ positions, currentPosition, onSelectPosition }: ReplayMapProps) {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const [showDetails, setShowDetails] = useState(false);
  const handlePointClick = useCallback(
    (_id: number, index: number) => onSelectPosition(index),
    [onSelectPosition],
  );
  const handleMarkerClick = useCallback(() => setShowDetails(true), []);

  return (
    <div className="relative h-full min-h-[19rem] overflow-hidden bg-slate-200">
      <MapView>
        <MapPadding start={desktop ? 376 : 0} />
        <MapOverlay />
        <MapGeofence />
        {positions.length > 0 && (
          <>
            <MapRoutePath positions={positions} />
            <MapRoutePoints positions={positions} onClick={handlePointClick} showSpeedControl />
          </>
        )}
        {currentPosition && (
          <CurrentPositionMarker position={currentPosition} onClick={handleMarkerClick} />
        )}
      </MapView>
      <MapScale />
      {positions.length > 0 && (
        <MapCamera
          latitude={undefined}
          longitude={undefined}
          positions={positions}
          coordinates={undefined}
        />
      )}
      {showDetails && currentPosition && (
        <div className="absolute bottom-4 left-4 z-10 max-w-[calc(100%-2rem)] rounded-xl border border-white/70 bg-white/95 p-3 text-xs shadow-xl backdrop-blur">
          <div className="flex items-start gap-3">
            <div>
              <p className="font-semibold text-slate-900">
                {new Date(currentPosition.fixTime).toLocaleString()}
              </p>
              <p className="mt-1 text-slate-600">
                {currentPosition.address ||
                  `${currentPosition.latitude.toFixed(5)}, ${currentPosition.longitude.toFixed(5)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails(false)}
              className="rounded-md px-2 py-1 font-semibold text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              aria-label="Close position details"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(ReplayMap);
