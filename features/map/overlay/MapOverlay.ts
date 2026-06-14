// @ts-nocheck
import { useId, useEffect } from 'react';
import { useAttributePreference } from '@/lib/preferences';
import { map } from '@/features/map/core/MapView';
import useMapOverlays from '@/features/map/overlay/useMapOverlays';

const MapOverlay = () => {
  const id = useId();

  const mapOverlays = useMapOverlays();
  const selectedMapOverlay = useAttributePreference('selectedMapOverlay');

  const activeOverlay = mapOverlays
    .filter((overlay) => overlay.available)
    .find((overlay) => overlay.id === selectedMapOverlay);

  useEffect(() => {
    if (activeOverlay) {
      map.addSource(id, activeOverlay.source);
      map.addLayer({
        id,
        type: 'raster',
        source: id,
        layout: {
          visibility: 'visible',
        },
      });
    }
    return () => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
      if (map.getSource(id)) {
        map.removeSource(id);
      }
    };
  }, [id, activeOverlay]);

  return null;
};

export default MapOverlay;
