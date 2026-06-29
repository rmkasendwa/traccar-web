export type ReplayDevice = {
  id: number;
  name: string;
  uniqueId?: string;
  status?: string;
  category?: string;
  model?: string;
  phone?: string;
  lastUpdate?: string;
  disabled?: boolean;
};

export type ReplayPosition = {
  id: number;
  deviceId: number;
  protocol?: string;
  serverTime?: string;
  deviceTime?: string;
  fixTime: string;
  valid?: boolean;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  course?: number;
  address?: string;
  accuracy?: number;
  attributes?: Record<string, unknown>;
};

export type ReplayStatistics = {
  distanceKm: number;
  durationMs: number;
  maxSpeedKph: number;
  averageSpeedKph: number;
  positionCount: number;
};
