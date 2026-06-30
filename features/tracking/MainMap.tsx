// @ts-nocheck
import { useMediaQuery, useTheme } from '@/components/ui';
import MapGeocoder from '@/features/map/control/MapGeocoder';
import MapNotification from '@/features/map/control/MapNotification';
import MapRuler from '@/features/map/control/MapRuler';
import MapView from '@/features/map/core/MapView';
import MapAccuracy from '@/features/map/main/MapAccuracy';
import MapDefaultCamera from '@/features/map/main/MapDefaultCamera';
import MapLiveRoutes from '@/features/map/main/MapLiveRoutes';
import MapSelectedDevice from '@/features/map/main/MapSelectedDevice';
import PoiMap from '@/features/map/main/PoiMap';
import MapCurrentLocation from '@/features/map/MapCurrentLocation';
import MapGeofence from '@/features/map/MapGeofence';
import MapPadding from '@/features/map/MapPadding';
import MapPositions from '@/features/map/MapPositions';
import MapScale from '@/features/map/MapScale';
import MapOverlay from '@/features/map/overlay/MapOverlay';
import useFeatures from '@/lib/useFeatures';
import { devicesActions } from '@/store';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const MainMap = ({ filteredPositions, selectedPosition, onEventsClick }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const eventsAvailable = useSelector((state) => !!state.events.items.length);

  const features = useFeatures();

  const [rulerActive, setRulerActive] = useState(false);

  const onMarkerClick = useCallback(
    (_, deviceId) => {
      dispatch(devicesActions.selectId(deviceId));
    },
    [dispatch],
  );

  return (
    <>
      <MapView>
        <MapOverlay />
        <MapGeofence />
        <MapAccuracy positions={filteredPositions} />
        <MapLiveRoutes deviceIds={filteredPositions.map((p) => p.deviceId)} />
        <MapPositions
          positions={filteredPositions}
          onMarkerClick={onMarkerClick}
          selectedPosition={selectedPosition}
          showStatus
          disabled={rulerActive}
        />
        <MapDefaultCamera filteredPositions={filteredPositions} />
        <MapSelectedDevice />
        <PoiMap />
        <MapRuler positions={filteredPositions} onActiveChange={setRulerActive} />
        {!features.disableEvents && (
          <MapNotification enabled={eventsAvailable} onClick={onEventsClick} />
        )}
      </MapView>
      <MapScale />
      <MapCurrentLocation />
      <MapGeocoder />
      {desktop && (
        <MapPadding
          start={
            parseInt(theme.dimensions.drawerWidthDesktop, 10) + parseInt(theme.spacing(1.5), 10)
          }
        />
      )}
    </>
  );
};

export default MainMap;
