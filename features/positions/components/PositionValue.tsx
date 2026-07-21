// @ts-nocheck
import { useSelector } from 'react-redux';
import { Link } from '@/components/ui';
import { Link as RouterLink } from '@/lib/router';
import { routes } from '@/lib/routes';
import {
  formatAlarm,
  formatAltitude,
  formatBoolean,
  formatCoordinate,
  formatCourse,
  formatDistance,
  formatNumber,
  formatNumericHours,
  formatPercentage,
  formatSpeed,
  formatTime,
  formatTemperature,
  formatVoltage,
  formatVolume,
  formatConsumption,
} from '@/lib/formatter';
import { speedToKnots } from '@/lib/converter';
import { useAttributePreference, usePreference } from '@/lib/preferences';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { useDeviceReadonly } from '@/lib/permissions';
import usePositionAttributes from '@/features/positions/hooks/usePositionAttributes';
import AddressValue from '@/features/positions/components/AddressValue';
import GeofencesValue from '@/features/geofences/components/GeofencesValue';
import DriverValue from '@/features/drivers/components/DriverValue';

const PositionValue = ({ position, property, attribute }) => {
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const positionAttributes = usePositionAttributes(t);

  const device = useSelector((state) => state.devices.items[position.deviceId]);

  const key = property || attribute;
  const value = property ? position[property] : position.attributes[attribute];

  const distanceUnit = useAttributePreference('distanceUnit');
  const altitudeUnit = useAttributePreference('altitudeUnit');
  const speedUnit = useAttributePreference('speedUnit');
  const volumeUnit = useAttributePreference('volumeUnit');
  const coordinateFormat = usePreference('coordinateFormat');

  const formatValue = () => {
    switch (key) {
      case 'fixTime':
      case 'deviceTime':
      case 'serverTime':
        return formatTime(value, 'seconds');
      case 'latitude':
        return formatCoordinate('latitude', value, coordinateFormat);
      case 'longitude':
        return formatCoordinate('longitude', value, coordinateFormat);
      case 'obdSpeed':
        return formatSpeed(speedToKnots(value, 'kmh'), speedUnit, t);
      case 'course':
        return formatCourse(value);
      case 'altitude':
        return formatAltitude(value, altitudeUnit, t);
      case 'fuelConsumption':
        return formatConsumption(value, t);
      case 'coolantTemp':
        return formatTemperature(value);
      case 'alarm':
        return formatAlarm(value, t);
      default:
        switch (positionAttributes[key]?.dataType) {
          case 'speed':
            return formatSpeed(value, speedUnit, t);
          case 'distance':
            return formatDistance(value, distanceUnit, t);
          case 'voltage':
            return formatVoltage(value, t);
          case 'percentage':
            return formatPercentage(value);
          case 'volume':
            return formatVolume(value, volumeUnit, t);
          case 'hours':
            return formatNumericHours(value, t);
          default:
            if (typeof value === 'number') {
              return formatNumber(value);
            }
            if (typeof value === 'boolean') {
              return formatBoolean(value, t);
            }
            return value || '';
        }
    }
  };

  if (key === 'address') {
    return (
      <AddressValue
        latitude={position.latitude}
        longitude={position.longitude}
        originalAddress={value}
      />
    );
  }

  if (value == null) {
    return '';
  }

  switch (key) {
    case 'image':
    case 'video':
    case 'audio':
      return (
        <Link href={`/api/media/${device.uniqueId}/${value}`} target="_blank">
          {value}
        </Link>
      );
    case 'totalDistance':
    case 'hours':
      return (
        <>
          {formatValue(value)}
          &nbsp;&nbsp;
          {!deviceReadonly && (
            <Link
              component={RouterLink}
              underline="none"
              to={routes.settings.accumulators(position.deviceId)}
            >
              &#9881;
            </Link>
          )}
        </>
      );
    case 'network':
      return (
        <Link component={RouterLink} underline="none" to={routes.network(position.id)}>
          {t('sharedInfoTitle')}
        </Link>
      );
    case 'geofenceIds':
      return <GeofencesValue geofenceIds={value} />;
    case 'driverUniqueId':
      return <DriverValue driverUniqueId={value} />;
    default:
      return formatValue(value);
  }
};

export default PositionValue;
