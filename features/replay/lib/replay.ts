import type { ReplayPosition, ReplayStatistics } from '@/features/replay/types';

const EARTH_RADIUS_KM = 6371;
const KNOTS_TO_KPH = 1.852;

export type SpeedHistogramBin = {
  startKph: number;
  endKph: number;
  count: number;
  firstPositionIndex: number;
};

const radians = (value: number) => (value * Math.PI) / 180;

const distanceBetween = (first: ReplayPosition, second: ReplayPosition) => {
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const firstLatitude = radians(first.latitude);
  const secondLatitude = radians(second.latitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

export const calculateReplayStatistics = (positions: ReplayPosition[]): ReplayStatistics => {
  const distanceKm = positions.slice(1).reduce((total, position, index) => {
    return total + distanceBetween(positions[index], position);
  }, 0);
  const durationMs = positions.length
    ? Math.max(
        0,
        Date.parse(positions[positions.length - 1].fixTime) - Date.parse(positions[0].fixTime),
      )
    : 0;
  const speedTotals = positions.reduce(
    (result, position) => {
      const speed = (position.speed || 0) * KNOTS_TO_KPH;
      return {
        total: result.total + speed,
        maximum: Math.max(result.maximum, speed),
      };
    },
    { total: 0, maximum: 0 },
  );

  return {
    distanceKm,
    durationMs,
    maxSpeedKph: speedTotals.maximum,
    averageSpeedKph: positions.length ? speedTotals.total / positions.length : 0,
    positionCount: positions.length,
  };
};

export const calculateSpeedHistogram = (positions: ReplayPosition[]): SpeedHistogramBin[] => {
  if (!positions.length) return [];

  const speedsKph = positions.map((position) =>
    Math.max(0, Number.isFinite(position.speed) ? (position.speed || 0) * KNOTS_TO_KPH : 0),
  );
  const maximum = Math.max(...speedsKph);
  const minimumBinWidth = Math.max(5, Math.ceil(maximum / 8 / 5) * 5);
  const binWidth = minimumBinWidth || 5;
  const binCount = Math.max(1, Math.ceil((maximum + Number.EPSILON) / binWidth));
  const bins = Array.from({ length: binCount }, (_, index) => ({
    startKph: index * binWidth,
    endKph: (index + 1) * binWidth,
    count: 0,
    firstPositionIndex: -1,
  }));

  speedsKph.forEach((speed, positionIndex) => {
    const binIndex = Math.min(Math.floor(speed / binWidth), bins.length - 1);
    const bin = bins[binIndex];
    bin.count += 1;
    if (bin.firstPositionIndex === -1) bin.firstPositionIndex = positionIndex;
  });

  return bins;
};

export const formatDuration = (durationMs: number) => {
  const minutes = Math.round(durationMs / 60_000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};
