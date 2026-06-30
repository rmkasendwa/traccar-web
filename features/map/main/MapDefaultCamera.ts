// @ts-nocheck
import { map } from '@/features/map/core/MapView';
import {
  clampCameraZoom,
  fitBoundsWithCameraMaxZoom,
  jumpToWithCameraMaxZoom,
} from '@/features/map/core/mapCamera';
import { toMapCoordinates } from '@/features/map/core/mapUtil';
import { useAttributePreference, usePreference } from '@/lib/preferences';
import maplibregl from 'maplibre-gl';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const MapDefaultCamera = ({ filteredPositions }) => {
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);
  const positions = useSelector((state) => state.session.positions);

  const defaultLatitude = usePreference('latitude');
  const defaultLongitude = usePreference('longitude');
  const defaultZoom = usePreference('zoom', 0);
  const maxZoom = useAttributePreference('web.maxZoom');

  const [initialized, setInitialized] = useState(false);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (
      initialized ||
      selectedDeviceId ||
      defaultLatitude ||
      defaultLongitude ||
      locationStatus !== 'idle'
    ) {
      if (!navigator.geolocation && locationStatus === 'idle') {
        setLocationStatus('denied');
      }
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('pending');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
      },
    );
  }, [defaultLatitude, defaultLongitude, initialized, locationStatus, selectedDeviceId]);

  useEffect(() => {
    if (initialized) return;

    if (selectedDeviceId) {
      const position = positions[selectedDeviceId];
      if (position) {
        jumpToWithCameraMaxZoom(
          {
            center: toMapCoordinates(position.longitude, position.latitude),
            zoom: Math.max(defaultZoom > 0 ? defaultZoom : map.getZoom(), 10),
          },
          maxZoom,
        );
        setInitialized(true);
      }
      return;
    }

    if (userLocation) {
      jumpToWithCameraMaxZoom(
        {
          center: toMapCoordinates(userLocation.longitude, userLocation.latitude),
          zoom: clampCameraZoom(defaultZoom > 0 ? defaultZoom : 13, maxZoom),
        },
        maxZoom,
      );
      setInitialized(true);
      return;
    }

    if (locationStatus === 'pending') {
      return;
    }

    if (defaultLatitude && defaultLongitude) {
      jumpToWithCameraMaxZoom(
        {
          center: toMapCoordinates(defaultLongitude, defaultLatitude),
          zoom: defaultZoom,
        },
        maxZoom,
      );
      setInitialized(true);
      return;
    }

    const coordinates = (filteredPositions || Object.values(positions)).map((item) =>
      toMapCoordinates(item.longitude, item.latitude),
    );
    if (coordinates.length > 1) {
      const bounds = coordinates.reduce(
        (bounds, item) => bounds.extend(item),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[1]),
      );
      const canvas = map.getCanvas();
      fitBoundsWithCameraMaxZoom(
        bounds,
        {
          duration: 0,
          padding: Math.min(canvas.width, canvas.height) * 0.1,
        },
        maxZoom,
      );
      setInitialized(true);
    } else if (coordinates.length) {
      const [individual] = coordinates;
      jumpToWithCameraMaxZoom(
        {
          center: individual,
          zoom: Math.max(defaultZoom > 0 ? defaultZoom : map.getZoom(), 10),
        },
        maxZoom,
      );
      setInitialized(true);
    }
  }, [
    selectedDeviceId,
    initialized,
    defaultLatitude,
    defaultLongitude,
    defaultZoom,
    positions,
    filteredPositions,
    userLocation,
    locationStatus,
    maxZoom,
  ]);

  return null;
};

export default MapDefaultCamera;
