import type {
  Attribute,
  Calendar,
  Command,
  CommandType,
  Device,
  DeviceAccumulators,
  Driver,
  Event,
  Geofence,
  Group,
  Maintenance,
  Notification,
  NotificationMessage,
  NotificationType,
  Order,
  Permission,
  Position,
  QueuedCommand,
  ReportGeofences,
  ReportStops,
  ReportSummary,
  ReportTrips,
  Server,
  Statistics,
  TraccarSchemaMap,
  User,
} from '@/types/traccar';

type Validator<T> = (value: unknown) => value is T;

export type ApiSchema<T> = {
  readonly name: string;
  readonly is: Validator<T>;
  readonly parse: (value: unknown) => T;
  readonly array: () => ApiSchema<T[]>;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const objectSchema = <T>(name: string, refine: Validator<T> = isObject as Validator<T>) => {
  const schema: ApiSchema<T> = {
    name,
    is: refine,
    parse(value) {
      if (!refine(value)) {
        throw new TypeError(`Invalid ${name} response`);
      }
      return value;
    },
    array() {
      return arraySchema(schema);
    },
  };
  return schema;
};

const arraySchema = <T>(itemSchema: ApiSchema<T>): ApiSchema<T[]> => ({
  name: `${itemSchema.name}[]`,
  is(value): value is T[] {
    return Array.isArray(value) && value.every(itemSchema.is);
  },
  parse(value) {
    if (!this.is(value)) {
      throw new TypeError(`Invalid ${itemSchema.name}[] response`);
    }
    return value;
  },
  array() {
    return arraySchema(this);
  },
});

const hasStringBody = (value: unknown): value is NotificationMessage =>
  isObject(value) && typeof value.body === 'string';

export const traccarSchemas = {
  Position: objectSchema<Position>('Position'),
  User: objectSchema<User>('User'),
  Server: objectSchema<Server>('Server'),
  Command: objectSchema<Command>('Command'),
  QueuedCommand: objectSchema<QueuedCommand>('QueuedCommand'),
  Device: objectSchema<Device>('Device'),
  Group: objectSchema<Group>('Group'),
  Permission: objectSchema<Permission>('Permission'),
  CommandType: objectSchema<CommandType>('CommandType'),
  Geofence: objectSchema<Geofence>('Geofence'),
  Notification: objectSchema<Notification>('Notification'),
  NotificationMessage: objectSchema<NotificationMessage>('NotificationMessage', hasStringBody),
  NotificationType: objectSchema<NotificationType>('NotificationType'),
  Event: objectSchema<Event>('Event'),
  ReportSummary: objectSchema<ReportSummary>('ReportSummary'),
  ReportGeofences: objectSchema<ReportGeofences>('ReportGeofences'),
  ReportTrips: objectSchema<ReportTrips>('ReportTrips'),
  ReportStops: objectSchema<ReportStops>('ReportStops'),
  Statistics: objectSchema<Statistics>('Statistics'),
  DeviceAccumulators: objectSchema<DeviceAccumulators>('DeviceAccumulators'),
  Calendar: objectSchema<Calendar>('Calendar'),
  Attribute: objectSchema<Attribute>('Attribute'),
  Driver: objectSchema<Driver>('Driver'),
  Maintenance: objectSchema<Maintenance>('Maintenance'),
  Order: objectSchema<Order>('Order'),
} satisfies { [SchemaName in keyof TraccarSchemaMap]: ApiSchema<TraccarSchemaMap[SchemaName]> };

export const parseApiResponse = <T>(schema: ApiSchema<T>, value: unknown): T => schema.parse(value);
