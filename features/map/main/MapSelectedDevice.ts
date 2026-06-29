// @ts-nocheck
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import dimensions from '@/components/ui/dimensions';
import { map } from '@/features/map/core/MapView';
import { usePrevious } from '@/lib/react';
import { useAttributePreference } from '@/lib/preferences';
import { toMapCoordinates } from '@/features/map/core/mapUtil';
import { easeToWithCameraMaxZoom } from '@/features/map/core/mapCamera';

const MapSelectedDevice = () => {
  const currentTime = useSelector((state) => state.devices.selectTime);
  const currentId = useSelector((state) => state.devices.selectedId);
  const previousTime = usePrevious(currentTime);
  const previousId = usePrevious(currentId);

  const selectZoom = useAttributePreference('web.selectZoom', 10);
  const mapFollow = useAttributePreference('mapFollow', false);

  const position = useSelector((state) => state.session.positions[currentId]);

  const previousPosition = usePrevious(position);

  useEffect(() => {
    const positionChanged =
      position &&
      (!previousPosition ||
        position.latitude !== previousPosition.latitude ||
        position.longitude !== previousPosition.longitude);

    if (
      (currentId !== previousId ||
        currentTime !== previousTime ||
        (mapFollow && positionChanged)) &&
      position
    ) {
      easeToWithCameraMaxZoom(
        {
          center: toMapCoordinates(position.longitude, position.latitude),
          zoom: Math.max(map.getZoom(), selectZoom),
          offset: [0, -dimensions.popupMapOffset / 2],
        },
        selectZoom,
      );
    }
  }, [
    currentId,
    previousId,
    currentTime,
    previousTime,
    mapFollow,
    position,
    previousPosition,
    selectZoom,
  ]);

  return null;
};

export default MapSelectedDevice;
