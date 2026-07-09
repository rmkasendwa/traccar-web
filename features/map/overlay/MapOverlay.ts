// @ts-nocheck
import { useId, useEffect, useMemo } from 'react';
import { useAttributePreference } from '@/lib/preferences';
import { map } from '@/features/map/core/MapView';
import useMapOverlays from '@/features/map/overlay/useMapOverlays';

const parseSelectedMapOverlays = (value) =>
  Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .filter(Boolean);

const MapOverlay = () => {
  const id = useId();

  const mapOverlays = useMapOverlays();
  const selectedMapOverlay = useAttributePreference('selectedMapOverlay');
  const selectedMapOverlays = useMemo(
    () => parseSelectedMapOverlays(selectedMapOverlay),
    [selectedMapOverlay],
  );

  const activeOverlays = useMemo(
    () =>
      selectedMapOverlays
        .map((overlayId) =>
          mapOverlays.find((overlay) => overlay.id === overlayId && overlay.available),
        )
        .filter(Boolean),
    [mapOverlays, selectedMapOverlays],
  );

  useEffect(() => {
    activeOverlays.forEach((overlay) => {
      const overlayId = `${id}-${overlay.id}`;
      map.addSource(overlayId, overlay.source);
      map.addLayer({
        id: overlayId,
        type: 'raster',
        source: overlayId,
        layout: {
          visibility: 'visible',
        },
      });
    });
    return () => {
      activeOverlays.forEach((overlay) => {
        const overlayId = `${id}-${overlay.id}`;
        if (map.getLayer(overlayId)) {
          map.removeLayer(overlayId);
        }
        if (map.getSource(overlayId)) {
          map.removeSource(overlayId);
        }
      });
    };
  }, [id, activeOverlays]);

  return null;
};

export default MapOverlay;
