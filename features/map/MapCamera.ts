// @ts-nocheck
import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { useAttributePreference } from '@/lib/preferences';
import { map } from '@/features/map/core/MapView';
import { toMapCoordinates } from '@/features/map/core/mapUtil';
import {
  clampCameraZoom,
  fitBoundsWithCameraMaxZoom,
  jumpToWithCameraMaxZoom,
} from '@/features/map/core/mapCamera';

const MapCamera = ({ latitude, longitude, positions, coordinates }) => {
  const maxZoom = useAttributePreference('web.maxZoom');

  useEffect(() => {
    if (coordinates || positions) {
      const coords = coordinates
        ? coordinates.map(([longitude, latitude]) => toMapCoordinates(longitude, latitude))
        : positions.map((item) => toMapCoordinates(item.longitude, item.latitude));
      if (coords.length) {
        const bounds = coords.reduce(
          (bounds, item) => bounds.extend(item),
          new maplibregl.LngLatBounds(coords[0], coords[0]),
        );
        const canvas = map.getCanvas();
        fitBoundsWithCameraMaxZoom(
          bounds,
          {
            padding: Math.min(canvas.width, canvas.height) * 0.1,
            duration: 0,
          },
          maxZoom,
        );
      }
    } else {
      jumpToWithCameraMaxZoom(
        {
          center: toMapCoordinates(longitude, latitude),
          zoom: clampCameraZoom(Math.max(map.getZoom(), 10), maxZoom),
        },
        maxZoom,
      );
    }
  }, [latitude, longitude, positions, coordinates, maxZoom]);

  return null;
};

export default MapCamera;
