// @ts-nocheck
import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';
import { map } from '@/features/map/core/MapView';
import { useTheme } from '@/components/ui';

const MapCurrentLocation = () => {
  const theme = useTheme();

  useEffect(() => {
    const control = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 5000,
      },
      trackUserLocation: false,
    });
    map.addControl(control, theme.direction === 'rtl' ? 'top-left' : 'top-right');
    return () => map.removeControl(control);
  }, [theme.direction]);

  return null;
};

export default MapCurrentLocation;
