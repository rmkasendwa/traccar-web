export type ApiPrimitive = string | number | boolean | null;
export type ApiJson = ApiPrimitive | ApiJson[] | { [key: string]: ApiJson | undefined };
export type ApiAttributes = Record<string, ApiJson | undefined>;

export type ApiId = number;
export type IsoDateTime = string;

export type TraccarEntity = {
  id?: ApiId;
  attributes?: ApiAttributes;
};

export type Position = TraccarEntity & {
  deviceId?: ApiId;
  protocol?: string;
  deviceTime?: IsoDateTime;
  fixTime?: IsoDateTime;
  serverTime?: IsoDateTime;
  valid?: boolean;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  speed?: number;
  course?: number;
  address?: string;
  accuracy?: number;
  network?: ApiAttributes;
  geofenceIds?: ApiId[];
};

export type User = TraccarEntity & {
  name?: string;
  email?: string;
  phone?: string | null;
  readonly?: boolean;
  administrator?: boolean;
  map?: string | null;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  password?: string;
  coordinateFormat?: string | null;
  disabled?: boolean;
  expirationTime?: IsoDateTime | null;
  deviceLimit?: number;
  userLimit?: number;
  deviceReadonly?: boolean;
  limitCommands?: boolean;
  fixedEmail?: boolean;
  poiLayer?: string | null;
};

export type Server = TraccarEntity & {
  registration?: boolean;
  readonly?: boolean;
  deviceReadonly?: boolean;
  limitCommands?: boolean;
  map?: string;
  bingKey?: string;
  mapUrl?: string;
  poiLayer?: string;
  announcement?: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  version?: string;
  forceSettings?: boolean;
  coordinateFormat?: string;
  openIdEnabled?: boolean;
  openIdForce?: boolean;
};

export type Command = TraccarEntity & {
  deviceId?: ApiId;
  description?: string;
  type?: string;
  textChannel?: boolean;
};

export type QueuedCommand = TraccarEntity & {
  deviceId?: ApiId;
  type?: string;
  textChannel?: boolean;
};

export type Device = TraccarEntity & {
  name?: string;
  uniqueId?: string;
  status?: 'online' | 'offline' | 'unknown' | string;
  disabled?: boolean;
  lastUpdate?: IsoDateTime | null;
  positionId?: ApiId | null;
  groupId?: ApiId | null;
  phone?: string | null;
  model?: string | null;
  contact?: string | null;
  category?: string | null;
};

export type Group = TraccarEntity & {
  name?: string;
  groupId?: ApiId;
};

export type Permission = {
  userId?: ApiId;
  deviceId?: ApiId;
  groupId?: ApiId;
  geofenceId?: ApiId;
  notificationId?: ApiId;
  calendarId?: ApiId;
  attributeId?: ApiId;
  driverId?: ApiId;
  managedUserId?: ApiId;
  commandId?: ApiId;
};

export type CommandType = {
  type?: string;
};

export type Geofence = TraccarEntity & {
  name?: string;
  description?: string;
  area?: string;
  calendarId?: ApiId;
};

export type Notification = TraccarEntity & {
  type?: string;
  description?: string | null;
  always?: boolean;
  commandId?: ApiId;
  notificators?: string;
  calendarId?: ApiId;
};

export type NotificationMessage = {
  subject?: string;
  digest?: string;
  body: string;
  priority?: boolean;
};

export type NotificationType = {
  type?: string;
};

export type Event = TraccarEntity & {
  type?: string;
  eventTime?: IsoDateTime;
  deviceId?: ApiId;
  positionId?: ApiId;
  geofenceId?: ApiId;
  maintenanceId?: ApiId;
};

export type ReportSummary = {
  deviceId?: ApiId;
  deviceName?: string;
  maxSpeed?: number;
  averageSpeed?: number;
  distance?: number;
  spentFuel?: number;
  engineHours?: number;
};

export type ReportGeofences = {
  deviceId?: ApiId;
  deviceName?: string;
  geofenceId?: ApiId;
  startTime?: IsoDateTime;
  endTime?: IsoDateTime;
};

export type ReportTrips = {
  deviceId?: ApiId;
  deviceName?: string;
  maxSpeed?: number;
  averageSpeed?: number;
  distance?: number;
  spentFuel?: number;
  duration?: number;
  startTime?: IsoDateTime;
  startAddress?: string;
  startLat?: number;
  startLon?: number;
  endTime?: IsoDateTime;
  endAddress?: string;
  endLat?: number;
  endLon?: number;
  driverUniqueId?: string;
  driverName?: string;
};

export type ReportStops = {
  deviceId?: ApiId;
  deviceName?: string;
  duration?: number;
  startTime?: IsoDateTime;
  address?: string;
  lat?: number;
  lon?: number;
  endTime?: IsoDateTime;
  spentFuel?: number;
  engineHours?: number;
};

export type Statistics = {
  captureTime?: IsoDateTime;
  activeUsers?: number;
  activeDevices?: number;
  requests?: number;
  messagesReceived?: number;
  messagesStored?: number;
};

export type DeviceAccumulators = {
  deviceId?: ApiId;
  totalDistance?: number;
  hours?: number;
};

export type Calendar = TraccarEntity & {
  name?: string;
  data?: string;
};

export type Attribute = TraccarEntity & {
  description?: string;
  attribute?: string;
  expression?: string;
  type?: string;
};

export type Driver = TraccarEntity & {
  name?: string;
  uniqueId?: string;
};

export type Maintenance = TraccarEntity & {
  name?: string;
  type?: string;
  start?: number;
  period?: number;
};

export type Order = TraccarEntity & {
  uniqueId?: string;
  description?: string;
  fromAddress?: string;
  toAddress?: string;
};

export type TraccarSchemaMap = {
  Position: Position;
  User: User;
  Server: Server;
  Command: Command;
  QueuedCommand: QueuedCommand;
  Device: Device;
  Group: Group;
  Permission: Permission;
  CommandType: CommandType;
  Geofence: Geofence;
  Notification: Notification;
  NotificationMessage: NotificationMessage;
  NotificationType: NotificationType;
  Event: Event;
  ReportSummary: ReportSummary;
  ReportGeofences: ReportGeofences;
  ReportTrips: ReportTrips;
  ReportStops: ReportStops;
  Statistics: Statistics;
  DeviceAccumulators: DeviceAccumulators;
  Calendar: Calendar;
  Attribute: Attribute;
  Driver: Driver;
  Maintenance: Maintenance;
  Order: Order;
};
